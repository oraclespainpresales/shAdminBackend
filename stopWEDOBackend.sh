MNGMT_PID=`ps -ef | grep WEDOBackend.sh | grep -v grep | awk '{split($0, a," "); print a[2]}'`
if [ -z "${MNGMT_PID}" ]
then
  echo "WEDO Backend is not running."
else
  for i in `ps -ef | grep "${MNGMT_PID}" | grep -v grep | awk '{split($0, a," "); print a[2]}'`
  do
    if [ "${MNGMT_PID}" -eq "$i" ]
    then 
      echo "Found the PID (${i}) of the WEDO Backend process. Killing it."
    else
      echo "Killing also the related grunt process (PID: ${i})."
    fi
    kill -9 "${i}"
  done
fi

