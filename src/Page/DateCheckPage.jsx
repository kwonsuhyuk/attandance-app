import { useState, useEffect, useRef } from "react";
import moment from "moment/moment.js";
import { get, getDatabase, ref } from "firebase/database";
import { useSelector } from "react-redux";
import "./DateCheckPage.css";
import Calendar from "react-calendar";
import { useNavigate, useParams } from "react-router-dom";
import { ClipLoader } from "react-spinners";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
const paymentMethods = {
  monthlyPay: "월급 지급",
  dailyPay: "일급 지급",
  hourPay: "시급 지급",
};

const DateCheckPage = () => {
  const [date, setDate] = useState(moment());
  const [workTimes, setWorkTimes] = useState({});
  const { currentUser } = useSelector((state) => state.user);
  const companyCode = currentUser?.photoURL; //회사 코드
  const [selectedDate, setSelectedDate] = useState(null);
  const { darkMode } = useSelector((state) => state.darkmodeSlice);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState();
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    async function getuserinfo() {
      setIsLoading(true);
      const db = getDatabase();
      const dbRef = ref(db, `companyCode/${currentUser?.photoURL}/users/${id}`);
      const snapshot = await get(dbRef);
      if (snapshot.val()) {
        setUser(snapshot.val());
      }
      setIsLoading(false);
    }
    getuserinfo();
    return () => {
      setUser([]);
    };
  }, [currentUser?.photoURL, id]);

  useEffect(() => {
    const db = getDatabase();
    const dateRef = ref(
      db,
      `companyCode/${companyCode}/users/${user?.uid}/date`
    );

    Promise.all([get(dateRef)]).then(([dateSnapshot]) => {
      if (dateSnapshot.exists()) {
        const dates = dateSnapshot.val();
        let newWorkTimes = {};
        for (let date in dates) {
          const { startTime, endTime } = dates[date];
          const start = new Date(startTime);
          const end = new Date(endTime);
          const workHours = Math.floor(Math.abs(end - start) / 36e5); //근무시간 계산 (시간)
          const workMinutes = Math.round(
            (Math.abs(end - start) % 36e5) / 60000
          ); //근무시간 계산 (분, 초단위 올림)
          newWorkTimes[date] = { workHours, workMinutes, startTime, endTime };
        }
        setWorkTimes(newWorkTimes);
      }
    });
  }, [companyCode, user?.uid, workTimes]);

  const tileContent = ({ date, view }) => {
    // Month view에 대해서만 커스텀 컨텐트를 제공합니다.
    if (view === "month") {
      const workTime = workTimes[moment(date).format("YYYY-MM-DD")];

      // If workTime exists for the date
      if (workTime) {
        const { workHours, workMinutes } = workTime;
        // 각 날짜에 대한 근무 시간, 시작 시간, 종료 시간을 반환합니다.
        return (
          <div className="text-base px-5 py-7 h-full flex items-center justify-center">
            <span
              className="bg-gray-700 text-white text-xs w-full"
              style={{ borderRadius: "10px" }}>
              {workHours}시간 {workMinutes}분
            </span>
          </div>
        );
      } else {
        // If workTime does not exist for the date
        return (
          <p className="text-xl px-5 py-7 h-full flex items-center justify-center"></p>
        );
      }
    }
  };

  const tileClassName = ({ date, view }) => {
    if (view === "month") {
      return `${darkMode ? "text-white" : "text-black"}`;
    }
  };

  const handleDateSelect = (date) => {
    setSelectedDate(moment(date));
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen w-screen">
        <ClipLoader
          color="black"
          size={100}
          aria-label="Loading Spinner"
          data-testid="loader"
        />
        <h3>로딩 중 입니다.</h3>
      </div> // 로딩 스피너
    );
  }

  const onChange = (date) => {
    setDate(date);
  };

  return (
    <div
      className="pb-10"
      style={{
        height: "calc(100vh - 10rem)",
        position: "relative",
        justifyContent: "flex-start",
        borderBottom: !darkMode ? "1px solid #00000080" : "1px solid #FFFFFF80",
      }}>
      <div
        className="grid h-full gap-7 place-content-start"
        style={{ gridTemplateColumns: "80fr 23fr" }}>
        <div className="h-full w-full">
          <div className="flex justify-between items-end font-bold">
            <div
              className="text-xl flex items-center cursor-pointer"
              onClick={() =>
                navigate(`/${currentUser?.photoURL}/employeelist`)
              }>
              직원 리스트로 가기
              <ArrowForwardIcon />{" "}
            </div>
            <div className="text-7xl">
              {selectedDate && selectedDate?.month() + 1}{" "}
              <span className="text-xs">月</span>
            </div>
          </div>
          <div
            style={{
              height: "90%",
              border: !darkMode ? "1px solid #00000080" : "1px solid #FFFFFF80",
            }}>
            <Calendar
              onChange={onChange} // 이 부분을 수정합니다.
              value={date}
              onClickDay={handleDateSelect}
              tileClassName={tileClassName}
              tileContent={tileContent}
              className={`h-full transition-all duration-500 ease-in-out overflow-hidden ${
                darkMode ? "text-white bg-dark-bg" : "text-black bg-white-bg"
              }`}
            />
          </div>
        </div>
        <div className="h-full w-full">
          <div className="text-end text-7xl font-bold">
            {selectedDate?.date()}
            <span className="text-xs">日</span>
          </div>
          <div
            className="w-full flex flex-col gap-7"
            style={{
              height: "90%",
            }}>
            <div
              className="w-full h-5/6 flex flex-col gap-12 py-7"
              style={{
                backgroundColor: darkMode ? "#363636" : "#D6D6D6",
                border: !darkMode
                  ? "1px solid #00000080"
                  : "1px solid #FFFFFF80",
              }}>
              {user ? (
                <div className="flex flex-col px-5 gap-3">
                  <div className="flex justify-between w-full text-sm">
                    <div className="text-xl font-semibold">{user?.name}</div>
                    <div>{user?.jobName}</div>
                  </div>
                  <div className="h-[1px] w-full bg-white-border dark:bg-dark-border"></div>
                  <div className="flex justify-between w-full text-sm">
                    <div className="font-semibold">급여 지급/계산 방법</div>
                    <div>
                      {user?.salaryType && paymentMethods[user.salaryType]}
                    </div>
                  </div>
                  <div className="h-[1px] w-full bg-white-border dark:bg-dark-border"></div>
                  <div className="flex justify-between w-full text-sm">
                    <div className="font-semibold">기본 설정 급여</div>
                    <div>{user?.salaryAmount && user.salaryAmount}</div>
                  </div>
                  <div className="h-[1px] w-full bg-white-border dark:bg-dark-border"></div>
                </div>
              ) : (
                <div className="flex justify-center items-center font-light h-full w-full">
                  PEOPLE 페이지에서 <br />
                  직원 상세정보&정산 버튼을 통해 직원을 선택하세요.
                </div>
              )}

              {selectedDate && (
                <div className="flex flex-col px-5 gap-3">
                  <h2 className="text-xl font-bold">
                    {selectedDate.month() + 1}월 {selectedDate.date()}일의
                    근무기록
                  </h2>
                  <div className="h-[1px] w-full bg-white-border dark:bg-dark-border"></div>
                  <div className="flex justify-between w-full text-sm">
                    <div>출근 시간</div>
                    <div>12시</div>
                  </div>
                  <div className="h-[1px] w-full bg-white-border dark:bg-dark-border"></div>
                  <div className="flex justify-between w-full text-sm">
                    <div>퇴근 시간</div>
                    <div>18시</div>
                  </div>
                  <div className="h-[1px] w-full bg-white-border dark:bg-dark-border"></div>
                  <div className="flex justify-between w-full text-sm">
                    <div>근무 시간</div>
                    <div>6시간</div>
                  </div>
                  <div className="h-[3px] w-full bg-white-border dark:bg-dark-border"></div>
                  <div className="flex justify-between w-full text-base font-semibold">
                    <div>오늘 급여</div>
                    <div>1000000원</div>
                  </div>
                </div>
              )}
            </div>
            <div className="w-full h-1/6 text-xl font-bold flex justify-center items-center text-white dark:text-black bg-black dark:bg-white cursor-pointer">
              이번달 직원 정산하기
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DateCheckPage;
