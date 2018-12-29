#include <unistd.h>
#include <string.h>
#include <stdio.h>
#include <stdlib.h>
#include <sys/types.h>
#include <sys/wait.h>

#define STRCONCAT(buf, offset, ...)                 \
  do                                                \
  {                                                 \
    char *bp = (char *)(buf + offset);              \
    const char *s,                                  \
        *a[] = {__VA_ARGS__, NULL},                 \
        **ss = a;                                   \
    while ((s = *ss++))                             \
      while ((*s) && (++offset < (int)sizeof(buf))) \
        *bp++ = *s++;                               \
    if (offset != sizeof(buf))                      \
      *bp = 0;                                      \
  } while (0);

int run(const char *name);

int main(int argc, char *argv[])
{
  if (argc < 2)
  {
    printf("Usage: %s cmd [args...]\n", argv[0]);
    exit(1);
  }

  int fd[2];
  if (pipe(fd) != 0)
  {
    perror("pipe");
    return EXIT_FAILURE;
  }

  pid_t pid = fork();
  if (pid == -1)
  {
    perror("fork");
  }
  else if (pid == 0)
  { // child
    close(fd[1]);
    close(STDIN_FILENO);
    if (dup(fd[0]) != 0)
    {
      perror("dup");
      exit(EXIT_FAILURE);
    }

    if (access("/bin/bash", X_OK) == 0)
    {
      run("/bin/bash");
    }
    else if (access("/bin/sh", X_OK) == 0)
    {
      run("/bin/sh");
    }
  }
  else
  {
    close(fd[0]);

    const char *homedir = getenv("HOME");
    char initsh[1024];
    int len = 0;
    STRCONCAT(initsh, len, homedir, "/", ".bashrc");

    if (access(initsh, F_OK) == 0)
    {
      char initrc[1024];
      len = 0;
      STRCONCAT(initrc, len, "source", " ", initsh, "\n");
      if (write(fd[1], initrc, strlen(initrc)) <= 0)
      {
        perror("write");
        exit(EXIT_FAILURE);
      }
    }

    int i;
    char *cmdstring = malloc(1024);

    for (i = 1; i < argc; i++)
    {
      strcat(cmdstring, argv[i]);
      if (argc > i + 1)
      {
        strcat(cmdstring, " ");
      }
    }

    if (write(fd[1], cmdstring, strlen(cmdstring)) <= 0)
    {
      perror("write");
      return EXIT_FAILURE;
    }
    close(fd[1]);

    int status;
    if (waitpid(pid, &status, 0) == -1)
    {
      perror("waitpid failed");
      return EXIT_FAILURE;
    }

    if (WIFEXITED(status))
    {
      const int code = WEXITSTATUS(status);
      return code;
    }
  }
}

int run(const char *name)
{
  char *_args[] = {(char *)name, (char *)0};
  execvp(name, _args);
}
