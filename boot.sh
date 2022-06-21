#!/bin/bash

SCREEN="build"
NAME="Build"
COMMAND="java -Xmx4G -Xms256M -XX:+UseConcMarkSweepGC -XX:+IgnoreUnrecognizedVMOptions -XX:+CMSIncrementalPacing -XX:ParallelGCThreads=1 -XX:+AggressiveOpts -XX:MaxPermSize=128M -DPaper.IgnoreJavaVersion=true -jar server.jar"

running(){
 if ! screen -list | grep -q "$SCREEN"
 then
  return 1
 else
  return 0
 fi
}

case "$1" in
 start)
  if ( running )
  then
echo "Error : Le serveur $NAME est déja démarré !"
  else
echo "Success : Démarrage du serveur $NAME !"
   rm logs/screen.log
   screen -dmS $SCREEN -L -c screen.conf $COMMAND
  fi
  ;;
 status)
    if ( running )
    then
echo "Running"
    else
echo "Not running"
    fi
  ;;
 screen)
   screen -x $SCREEN
 ;;
 reload)
   screen -S $SCREEN -p 0 -X stuff `printf "reload\r"`
 ;;
 irestart)
  if ( running )
  then
   	screen -S $SCREEN  -X stuff "kick @a Le serveur redémare^M"
   	sleep 1
   	screen -S $SCREEN  -X stuff "stop^M"
   	echo "Success : Arret du serveur [$NAME] !"
   	echo "Success : Démarrage du serveur $NAME !"
   	rm logs/screen.log
   	screen -dmS $SCREEN -L -c screen.conf $COMMAND
  else
   echo "Error : Le serveur $NAME n'est pas en ligne !"
  fi
 ;;
 stop)
  if ( running )
  then
screen -S $SCREEN -p 0 -X stuff `printf "stop\r"`
   echo "Success : Arret du serveur [$NAME] !"
  else
echo "Error : Le serveur $NAME n'est pas en ligne !"
  fi
 ;;
 restart)
  if ( running )
  then
	screen -S $SCREEN  -X stuff "say Redémarrage du serveur dans 1 minute !^M"
	sleep 55
	screen -S $SCREEN  -X stuff "say Redémarrage dans 5 secondes !^M"
	sleep 1
	screen -S $SCREEN  -X stuff "say Redémarrage dans 4 secondes !^M"
	sleep 1
	screen -S $SCREEN  -X stuff "say Redémarrage dans 3 secondes !^M"
	sleep 1
	screen -S $SCREEN  -X stuff "say Redémarrage dans 2 secondes !^M"
	sleep 1
	screen -S $SCREEN  -X stuff "say Redémarrage dans 1 seconde !^M"
	sleep 1
	screen -S $SCREEN  -X stuff "kick @a Le serveur redémare^M"
	sleep 1
	screen -S $SCREEN  -X stuff "stop^M"
	echo "Success : Arret du serveur [$NAME] !"
	echo "Success : Démarrage du serveur $NAME !"
	rm logs/screen.log
	screen -dmS $SCREEN -L -c screen.conf $COMMAND
  else
echo "Error : Le serveur $NAME n'est pas démarré !"
  fi
  ;;
*)

 echo "Usage : {start|stop|restart|status|screen|reload}"
 exit 1
 ;;
esac

exit 0
