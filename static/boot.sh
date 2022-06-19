#!/bin/bash

SCREEN="survie" 
NAME="Survie"
COMMAND="java -Xms1G -Xmx15G -jar spigot.jar"

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
   screen -dmS $SCREEN $COMMAND
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
   screen -r $SCREEN
 ;;
 reload)
   screen -S $SCREEN -p 0 -X stuff `printf "reload\r"`
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
	sleep 2
	echo "Success : Démarrage du serveur $NAME !"
	screen -dmS $SCREEN $COMMAND
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