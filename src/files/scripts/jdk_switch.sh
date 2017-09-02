#!/usr/bin/env bash

OPENJDK8_JAVA_HOME="/usr/lib/jvm/java-1.8.0-openjdk-amd64"
ORACLEJDK8_JAVA_HOME="/usr/lib/jvm/java-8-oracle"
ORACLEJDK9_JAVA_HOME="/usr/lib/jvm/java-9-oracle"

switch_to_openjdk8() {
  local ALIAS=`echo $OPENJDK8_JAVA_HOME | awk -F '/' '{print $NF}'`
  echo "Switching to OpenJDK8 ($ALIAS) ..."
  sudo update-java-alternatives --set $ALIAS
  export JAVA_HOME="$OPENJDK8_JAVA_HOME"
}

switch_to_oraclejdk8() {
  local ALIAS=`echo $ORACLEJDK8_JAVA_HOME | awk -F '/' '{print $NF}'`
  echo "Switching to OracleJDK8  ($ALIAS) ..."
  sudo update-java-alternatives --set $ALIAS
  export JAVA_HOME="$ORACLEJDK8_JAVA_HOME"
}

switch_to_oraclejdk9() {
  local ALIAS=`echo $ORACLEJDK9_JAVA_HOME | awk -F '/' '{print $NF}'`
  echo "Switching to OracleJDK9 ($ALIAS) ..."
  sudo update-java-alternatives --set $ALIAS
  export JAVA_HOME="$ORACLEJDK9_JAVA_HOME"
}

jdk_switcher() {
  typeset JDK
  JDK="$1"

  case "$JDK" in
    openjdk8 | jdk8 | 1.8.0 | 1.8 | 8.0)
      switch_to_openjdk8
      ;;
    oraclejdk8 | oraclejdk1.8 | oraclejdk1.8.0 | oracle8 | oracle1.8.0 | oracle8.0)
      switch_to_oraclejdk8
      ;;
    oraclejdk9 | oraclejdk1.9 | oraclejdk1.9.0 | oracle9 | oracle1.9.0 | oracle9.0)
      switch_to_oraclejdk9
      ;;
    *)
      echo "Sorry, but JDK '$1' is not known." >&2
      false
      ;;
  esac

  return $?
}

if [ "$#" -ne 1 ]; then
  echo "Please specify JDK you want to use."
else
  jdk_switcher $1
fi
