MNGMT_PID=`ps -ef | grep WEDOBackend.sh | grep -v grep | awk '{split($0, a," "); print a[2]}'`
if [ -z "${MNGMT_PID}" ]
then
  echo "Starting the WEDO Backend process."
  nohup ./WEDOBackend.sh > WEDOBackend.log 2>&1 &
else
  echo "WEDO Backend already running (PID: ${MNGMT_PID})."
fi



