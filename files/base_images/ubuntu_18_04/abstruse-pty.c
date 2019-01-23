#include <unistd.h>
#include <string.h>
#include <stdio.h>
#include <stdlib.h>
#include <sys/types.h>
#include <sys/wait.h>

int main(int argc, char *argv[])
{
  if (argc < 2)
  {
    printf("Usage: %s cmd [args...]\n", argv[0]);
    exit(1);
  }

  int fd[2];
  pipe(fd);
  pid_t pid = fork();
  if (pid == -1)
  {
    perror("fork");
  }
  else if (pid == 0)
  { // child
    char *args[] = {NULL};
    close(fd[1]);
    close(STDIN_FILENO);
    dup(fd[0]);
    execvp("/bin/bash", args);
  }
  else
  {
    close(fd[0]);

    const char *initsh = "/home/abstruse/.bashrc";
    if (access(initsh, F_OK) != -1)
    {
      const char *initrc = "source /home/abstruse/.bashrc\n";
      write(fd[1], initrc, strlen(initrc));
    }

    int i;
    char *cmdstring = NULL;
    cmdstring = malloc(1024);
    cmdstring[0] = '\0';

    for (i = 1; i < argc; i++)
    {
      strcat(cmdstring, argv[i]);
      if (argc > i + 1)
      {
        strcat(cmdstring, " ");
      }
    }

    write(fd[1], cmdstring, strlen(cmdstring));
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
