# /bin/sh



FILE=error_log.txt
CLEARSIZE=500000;
if [ -f "$FILE" ]; then
    echo "$FILE exists."

   else 
    echo "$FILE does not exist. Initalizing javascript error log..." 
    touch error_log.txt 
fi


while true 

do 

echo Starting Fluttershy 


 node .
 2>&1 error_log.txt 
date +"Error Generated at: %A %d %B %r" >> error_log.txt

    

echo There Was An Error 

 2>&1 error_log.txt 
date +"Error Generated at: %A %d %B %r" >> error_log.txt


echo Restarting Fluttershy in 30 Seconds... 


sleep 30

done 


