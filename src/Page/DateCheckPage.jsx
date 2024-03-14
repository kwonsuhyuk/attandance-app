import { useState, useEffect } from "react";
import { get, getDatabase, ref } from "firebase/database";
import { useSelector } from "react-redux";
import "./DateCheckPage.css";
import Calendar from "react-calendar";
import { useNavigate, useParams } from "react-router-dom";
import { ClipLoader } from "react-spinners";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import GuidePopover from "../Components/GuidePopover";
import { Button, DatePicker, Modal } from "antd";
const paymentMethods = {
  monthlyPay: "월급 지급",
  dailyPay: "일급 지급",
  hourPay: "시급 지급",
};
("react");
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import { formatMoney } from "../util/formatMoney";
import { toast } from "react-toastify";
import convertTime from "../util/formatTime";
import { useTour } from "@reactour/tour";
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

const { RangePicker } = DatePicker;

const DateCheckPage = ({
  modalDefaultValue,
  nightPay,
  holidayPay,
  holidayList,
}) => {
  const [modalDates, setModalDates] = useState([
    dayjs().subtract(1, "month").date(modalDefaultValue),
    dayjs().subtract(1, "day"),
  ]);
  const [date, setDate] = useState(dayjs());
  const [workTimes, setWorkTimes] = useState({});
  const { currentUser } = useSelector((state) => state.user);
  const companyCode = currentUser?.photoURL; //회사 코드
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const { darkMode } = useSelector((state) => state.darkmodeSlice);
  const [isLoading, setIsLoading] = useState(false);
  const [workDates, setWorkDates] = useState({});
  const [user, setUser] = useState();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const [salaryInfo, setSalaryInfo] = useState(null);
  const { isOpen, setCurrentStep, setSteps } = useTour();

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        setCurrentStep(0);
        setSteps([
          {
            selector: '[data-tour="step-9"]',
            content: `이곳은 직원의 근태관리를 자세하게 할 수 있는 페이지 입니다. 근태관리를 할 직원 의 옆에 있는 상세보기 & 정산 버튼 을 선택을 안하고 들어왔다면 데이터가 없습니다. 기능을 이용하실려면 
반드시 직원 리스트에서 근태 확인 할 직원 옆에 있는 상세보기 & 정산을 클릭하고 들어오셔야 합니다!`,
          },
          {
            selector: '[data-tour="step-10"]',
            content: `우선 달력 부분 입니다. 이 달력에는 해당 직원의 근무 시간을 간략하게 보여주며, 외근 여부도 보여주는 셀 입니다. 아무 날짜 하나만 클릭해보세요.`,
          },
        ]);
      }, 300);

      return () => {
        clearTimeout(timer), setSteps([]);
      };
    }
  }, [isOpen, setCurrentStep, setSteps]);

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
    const dateRef1 = ref(
      db,
      `companyCode/${companyCode}/users/${user?.uid}/date`
    );
    const dateRef2 = ref(
      db,
      `companyCode/${companyCode}/users/${user?.uid}/workDates`
    );

    Promise.all([get(dateRef1), get(dateRef2)]).then(
      ([dateSnapshot1, dateSnapshot2]) => {
        if (dateSnapshot1.exists()) {
          const dates = dateSnapshot1.val();
          let newWorkTimes = {};
          for (let date in dates) {
            const { startTime, endTime } = dates[date];
            const start = new Date(startTime);
            const end = new Date(endTime);
            const workHours = Math.floor(Math.abs(end - start) / 36e5);
            const workMinutes = Math.round(
              (Math.abs(end - start) % 36e5) / 60000
            );
            newWorkTimes[date] = { workHours, workMinutes, startTime, endTime };
          }
          setWorkTimes(newWorkTimes);
        }

        if (dateSnapshot2.exists()) {
          const workDates = dateSnapshot2.val();
          setWorkDates(workDates);
        }
      }
    );
  }, [companyCode, user?.uid]);

  useEffect(() => {
    return () => {
      setSalaryInfo([]);
    };
  }, []);

  const tileContent = ({ date, view }) => {
    // Month view에 대해서만 커스텀 컨텐트를 제공합니다.
    if (view === "month") {
      const workTime = workTimes[dayjs(date).format("YYYY-MM-DD")];

      // If workTime exists for the date
      if (workTime) {
        if (workTime.startTime == "외근") {
          return (
            <div className="text-base px-5 py-5 h-full flex items-center justify-center">
              <span
                className="bg-blue-300 text-white text-xs w-full p-1"
                style={{ borderRadius: "10px" }}>
                외근
              </span>
            </div>
          );
        }
        const { workHours, workMinutes } = workTime;

        // 각 날짜에 대한 근무 시간, 시작 시간, 종료 시간을 반환합니다.
        return (
          <div className="text-base px-5 py-5 h-full flex items-center justify-center">
            <span
              className="bg-gray-700 text-white text-xs w-full p-1"
              style={{ borderRadius: "10px" }}>
              {workHours > 9 ? workHours - 1 : workHours}시간 {workMinutes}분
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

  const tileClassName = ({ view, date }) => {
    const dateString = date.toLocaleDateString("fr-CA"); // 날짜를 "YYYY-MM-DD" 형식의 문자열로 변환

    if (
      holidayList &&
      view === "month" &&
      (date.getDay() === 0 || date.getDay() === 6 || holidayList[dateString])
    ) {
      return "weekend";
    }

    if (view === "month") {
      return `${darkMode ? "text-white" : "text-black"}`;
    }
  };

  const handleDateSelect = (date) => {
    setSelectedDate(dayjs(date));
    if (isOpen) {
      setCurrentStep(2);
      setSteps((prev) => [
        ...prev,
        {
          selector: '[data-tour="step-11"]',
          content: `이곳은 직원의 간단한 정보와 함께, 해당 날짜의 직원이 출근, 퇴근 한 시간 , 근무 시간과 근무 시간대, 오늘 급여 등 자세한 정보를 볼 수 있는 칸 입니다.
(월급 으로 지정된 직원은 금일 급여 및 근무 시간대가 보이지 않습니다.)`,
        },
        {
          selector: '[data-tour="step-12"]',
          content: `다음은 직원의 월 정산을 할 수 있는 버튼 입니다. 아래 버튼을 클릭해 보세요.`,
          highlightedSelectors: [".ant-modal"],
          mutationObservables: [".ant-modal-root"],
        },
      ]);
    }
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

  const handleOpenSettleModal = () => {
    if (isOpen) {
      setIsModalOpen(true);
      setTimeout(() => {
        setCurrentStep(0);
        setSteps([
          {
            selector: '[data-tour="step-13"]',
            content: `이곳은 선택한 직원의 정산을 도와주는 곳입니다. 위의 날짜 범위를 설정하셔서 범위 사이의 직원의 근무시간, 외근 횟수, 총 급여등을 계산해 주고 있습니다.`,
          },
          {
            selector: '[data-tour="step-14"]',
            content: `날짜는 기본값으로 전달 회사의 정산일 부터, 당일로 들어가 있고, 클릭하셔서 변경하실 수 있습니다.`,
          },
          {
            selector: '[data-tour="step-15"]',
            content: `날짜 범위를 설정 후에 위의 정산하기 버튼을 클릭하시면 직원의 정산 결과가 나옵니다. 클릭해보시겠어요?`,
          },
        ]);
      }, 300);
    }
    if (user) {
      setIsModalOpen(true);
    } else {
      toast.error("정산할 직원을 선택해 주세요.");
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setSalaryInfo(null);
    if (isOpen) {
      setCurrentStep(0);
      setSteps([
        {
          selector: '[data-tour="step-18"]',
          content: `클릭하셔서 SETTING 페이지로 이동해보겠습니다.`,
        },
      ]);
    }
  };

  const calculateSalary = () => {
    if (isOpen) {
      setTimeout(() => {
        setCurrentStep(3);
        setSteps((prev) => [
          ...prev,
          {
            selector: '[data-tour="step-16"]',
            content: `아래와 같이 정산 결과를 확인하실 수 있습니다.`,
          },
          {
            selector: '[data-tour="step-17"]',
            content: `닫기 버튼을 클릭후에 마지막으로 오른쪽 위 메뉴바에 SETTING을 클릭하셔서 설정 페이지로 이동해 보겠습니다.`,
          },
        ]);
      }, 300);
    }
    // 선택한 기간 내에 있는 workdates를 필터링합니다.
    const filteredWorkdates = Object.entries(workDates).filter(
      ([date]) =>
        dayjs(date).isSameOrBefore(modalDates[1]) &&
        dayjs(date).isSameOrAfter(modalDates[0])
    );

    // 필터링된 workDates 대해 주간, 야간, 공휴일 시간을 계산합니다.
    let totalDayHours = 0;
    let totalNightHours = 0;
    let totalHolidayHours = 0;

    let totalDaySalary = 0;
    let totalNightSalary = 0;
    let totalHolidaySalary = 0;

    let totalOutJob = 0;
    let totalWorkHour = 0;

    filteredWorkdates.forEach(([dates, workDates]) => {
      if (workDates.workHour == "외근") {
        totalOutJob++;
      } else {
        if (workDates.daySalary > 0) {
          totalDayHours += workDates.workHour;
          totalDaySalary += workDates.daySalary;
        }
        if (workDates.nightSalary > 0) {
          totalNightHours += workDates.workHour;
          totalNightSalary += workDates.nightSalary;
        }
        if (workDates.holidayAndWeekendSalary > 0) {
          totalHolidayHours += workDates.workHour;
          totalHolidaySalary += workDates.holidayAndWeekendSalary;
        }
        if (workDates.workHour > 9) {
          totalWorkHour += workDates.workHour - 1;
        } else {
          totalWorkHour += workDates.workHour;
        }
      }
    });

    const totalSalary = totalDaySalary + totalNightSalary + totalHolidaySalary;

    setSalaryInfo({
      totalWorkHour,
      totalOutJob,
      totalDayHours,
      totalNightHours,
      totalHolidayHours,
      totalDaySalary,
      totalNightSalary,
      totalHolidaySalary,
      totalSalary,
    });
  };

  return (
    <div
      className="pb-10 px-3"
      style={{
        height: "calc(100vh - 10rem)",
        marginBottom: "3rem",
        position: "relative",
        justifyContent: "flex-start",
        overflowY: "auto",
        overflowX: "hidden",
        borderBottom: !darkMode ? "1px solid #00000080" : "1px solid #FFFFFF80",
      }}>
      <div
        data-tour="step-9"
        className="grid h-full gap-7 place-content-start"
        style={{ gridTemplateColumns: "80fr 23fr" }}>
        <div className="h-full w-full">
          <div className="flex justify-between items-end font-bold">
            <div
              style={{ borderRadius: "10px" }}
              className="text-xl flex items-center cursor-pointer p-3 underline"
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
            data-tour="step-10"
            style={{
              height: "90%",
              border: !darkMode ? "1px solid #00000080" : "1px solid #FFFFFF80",
            }}>
            <Calendar
              onChange={onChange}
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
              data-tour="step-11"
              style={{
                backgroundColor: darkMode ? "#363636" : "#D6D6D6",
                border: !darkMode
                  ? "1px solid #00000080"
                  : "1px solid #FFFFFF80",
              }}>
              {user ? (
                <div className="flex flex-col px-5 gap-3">
                  <div className="flex justify-between w-full text-sm items-center">
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
                <div className="flex justify-center items-center font-light h-full w-full text-center leading-7">
                  PEOPLE 페이지에서 <br />
                  직원 상세정보&정산 버튼을 통해 직원을 선택하세요.
                </div>
              )}

              {selectedDate && user && (
                <div className="flex flex-col px-5 gap-3">
                  <h2 className="text-xl font-bold">
                    {selectedDate.month() + 1}월 {selectedDate.date()}일의
                    근무기록
                  </h2>
                  <div className="h-[1px] w-full bg-white-border dark:bg-dark-border"></div>
                  {workTimes[selectedDate.format("YYYY-MM-DD")]?.startTime ==
                  "외근" ? (
                    <div className="flex justify-center items-center h-48 w-full text-lg">
                      외근
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between w-full text-sm">
                        <div>출근 시간</div>
                        <div>
                          {workTimes[selectedDate.format("YYYY-MM-DD")]
                            ? new Date(
                                workTimes[
                                  selectedDate.format("YYYY-MM-DD")
                                ].startTime
                              ).toLocaleString("ko-KR", {
                                month: "long",
                                day: "numeric",
                                hour: "numeric",
                                minute: "numeric",
                                second: "numeric",
                                hour12: false,
                              })
                            : "데이터 없음"}
                        </div>
                      </div>

                      <div className="h-[1px] w-full bg-white-border dark:bg-dark-border"></div>
                      <div className="flex justify-between w-full text-sm">
                        <div>퇴근 시간</div>
                        <div>
                          {workTimes[selectedDate.format("YYYY-MM-DD")]
                            ? new Date(
                                workTimes[
                                  selectedDate.format("YYYY-MM-DD")
                                ].endTime
                              ).toLocaleString("ko-KR", {
                                month: "long",
                                day: "numeric",
                                hour: "numeric",
                                minute: "numeric",
                                second: "numeric",
                                hour12: false,
                              })
                            : "데이터 없음"}
                        </div>
                      </div>

                      <div className="h-[1px] w-full bg-white-border dark:bg-dark-border"></div>
                      <div className="flex justify-between w-full text-sm">
                        <div>근무 시간</div>
                        <div>
                          {workTimes[selectedDate.format("YYYY-MM-DD")]
                            ?.workHours || 0}
                          시간{" "}
                          {workTimes[selectedDate.format("YYYY-MM-DD")]
                            ?.workMinutes || 0}
                          분
                        </div>
                      </div>
                      <div className="h-[1px] w-full bg-white-border dark:bg-dark-border"></div>
                      {user?.salaryType && user.salaryType != "monthlyPay" && (
                        <>
                          <div className="flex justify-between w-full text-sm">
                            <div>급여 지급 구분</div>
                            <div>
                              {workDates[selectedDate?.format("YYYY-MM-DD")] &&
                                Object.keys(
                                  workDates[selectedDate?.format("YYYY-MM-DD")]
                                )?.map((key, index) => {
                                  if (
                                    workDates[
                                      selectedDate?.format("YYYY-MM-DD")
                                    ][key] > 0 &&
                                    key != "workHour"
                                  ) {
                                    let displayText = "";
                                    switch (key) {
                                      case "holidayAndWeekendSalary":
                                        displayText = "공휴일 급여";
                                        break;
                                      case "nightSalary":
                                        displayText = "야간 급여";
                                        break;
                                      case "daySalary":
                                        displayText = "주간 급여";
                                        break;
                                    }
                                    return <div key={index}>{displayText}</div>;
                                  }
                                })}
                            </div>
                          </div>
                        </>
                      )}

                      <div className="h-[3px] w-full bg-white-border dark:bg-dark-border"></div>
                      {user?.salaryType && user.salaryType == "monthlyPay" ? (
                        <div></div>
                      ) : (
                        <>
                          <div className="flex justify-between w-full text-base font-semibold">
                            <div>오늘 급여</div>
                            {/* 데이터 불러와지면 여기에 삽입 */}
                            <div>
                              {workDates[selectedDate?.format("YYYY-MM-DD")] &&
                                Object.keys(
                                  workDates[selectedDate?.format("YYYY-MM-DD")]
                                )?.map((key, index) => {
                                  if (
                                    workDates[
                                      selectedDate?.format("YYYY-MM-DD")
                                    ][key] > 0 &&
                                    key != "workHour"
                                  ) {
                                    return (
                                      <div key={index}>
                                        {
                                          workDates[
                                            selectedDate?.format("YYYY-MM-DD")
                                          ][key]
                                        }
                                        원
                                      </div>
                                    );
                                  }
                                })}
                            </div>
                          </div>
                        </>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
            <div
              data-tour="step-12"
              className="w-full h-1/6 text-xl font-bold flex justify-center items-center text-white dark:text-black bg-black dark:bg-white cursor-pointer"
              onClick={handleOpenSettleModal}>
              {user ? "이번달 직원 정산하기" : "직원을 선택해 주세요."}
            </div>

            <Modal
              title={`${user?.name}/${user?.jobName}의 이번달 정산`}
              open={isModalOpen}
              onCancel={handleCancel}
              cancelText="닫기"
              footer={[
                <Button key="back" onClick={handleCancel} data-tour="step-17">
                  닫기
                </Button>,
              ]}>
              <div className="flex flex-col" data-tour="step-13">
                <RangePicker
                  data-tour="step-14"
                  defaultValue={modalDates}
                  onChange={(dates) => {
                    setModalDates(dates);
                  }}
                />
                <div className="text-xs">
                  (시작 날 당일 부터 끝나는 날 당일 까지 계산합니다.)
                </div>
                <Button
                  data-tour="step-15"
                  key="calculate"
                  onClick={calculateSalary}
                  className="mt-7 mb-7">
                  정산하기
                </Button>
                <div
                  data-tour="step-16"
                  className="text-black"
                  style={{
                    padding: 5,
                  }}>
                  {salaryInfo && user?.salaryType != "monthlyPay" && (
                    <div className="flex flex-col" style={{ height: "auto" }}>
                      <div
                        className="flex justify-between items-center py-3"
                        style={{
                          borderTop: "2px solid black",
                          borderBottom: "2px solid black",
                        }}>
                        <div>
                          <strong className="text-xl font-bold">총 급여</strong>
                        </div>
                        <div className="text-red-500 font-bold text-base">
                          {formatMoney(salaryInfo.totalSalary)} 원
                        </div>
                      </div>
                      <div className="grid grid-cols-4 my-3">
                        <div>
                          <strong className="text-xl font-bold">
                            시간 타입
                          </strong>
                        </div>
                        <div>
                          <strong className="text-xl font-bold">
                            근무 시간
                          </strong>
                        </div>
                        <div>
                          <strong className="text-xl font-bold">
                            설정 급여
                          </strong>
                        </div>
                        <div>
                          <strong className="text-xl font-bold">급여</strong>
                        </div>
                      </div>
                      <div className="w-full h-[1px] bg-black"></div>
                      <div className="grid grid-cols-4 my-3">
                        <div>주간</div>
                        <div>{salaryInfo.totalDayHours?.toFixed(1)} 시간</div>
                        <div>{formatMoney(user?.salaryAmount)}원</div>
                        <div>{formatMoney(salaryInfo.totalDaySalary)}원</div>
                      </div>
                      <div className="w-full h-[1px] bg-gray-300"></div>
                      <div className="grid grid-cols-4 my-3">
                        <div>야간</div>
                        <div>{salaryInfo.totalNightHours?.toFixed(1)} 시간</div>
                        <div className="flex flex-col">
                          <span>
                            {formatMoney(user?.salaryAmount * nightPay)}원
                          </span>
                          <span className="text-xs font-thin">
                            ({user?.salaryAmount}원 x {nightPay})
                          </span>
                        </div>
                        <div>{formatMoney(salaryInfo.totalNightSalary)}원</div>
                      </div>
                      <div className="w-full h-[1px] bg-gray-300"></div>
                      <div className="grid grid-cols-4 my-3">
                        <div>공휴일</div>
                        <div>
                          {salaryInfo.totalHolidayHours?.toFixed(1)} 시간
                        </div>
                        <div className="flex flex-col">
                          <span>
                            {formatMoney(user?.salaryAmount * holidayPay)}원
                          </span>
                          <span className="text-xs font-thin">
                            ({user?.salaryAmount}원 x {holidayPay})
                          </span>
                        </div>
                        <div>
                          {formatMoney(salaryInfo.totalHolidaySalary)}원
                        </div>
                      </div>
                      <div className="w-full h-[1px] bg-gray-300"></div>
                      <div
                        className="flex justify-between items-center py-3"
                        style={{
                          borderTop: "1px solid black",
                          borderBottom: "2px solid black",
                        }}>
                        <div>
                          <strong className="text-xl font-bold">
                            총 외근 횟수
                          </strong>
                        </div>
                        <div>{salaryInfo?.totalOutJob}회</div>
                        <div>
                          <strong className="text-xl font-bold">총 시간</strong>
                        </div>
                        <div>
                          {convertTime(
                            salaryInfo.totalDayHours +
                              salaryInfo.totalNightHours +
                              salaryInfo.totalHolidayHours
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  {/* 월급쟁이 */}
                  {salaryInfo && user?.salaryType == "monthlyPay" && (
                    <div className="flex flex-col" style={{ height: "auto" }}>
                      <div
                        className="flex justify-between items-center py-3 px-3"
                        style={{ borderTop: "2px solid black" }}>
                        <div>
                          <strong className="text-xl font-bold">
                            이번 달 급여
                          </strong>
                        </div>
                        <div className="text-red-500 font-bold text-base">
                          {user?.salaryAmount &&
                            formatMoney(user?.salaryAmount)}
                          원
                        </div>
                      </div>
                      <div
                        className="text-xs"
                        style={{
                          borderBottom: "2px solid black",
                        }}>
                        (월급 직원으로, 설정된 급여로 정산됩니다.)
                      </div>
                      <div
                        className="flex justify-between items-center py-3 px-3"
                        style={{
                          borderBottom: "1px solid black",
                        }}>
                        <div>
                          <strong className="text-xl font-bold">
                            총 외근 횟수
                          </strong>
                        </div>
                        <div>{salaryInfo?.totalOutJob}회</div>
                      </div>
                      <div
                        className="flex justify-between items-center py-3 px-3"
                        style={{
                          borderTop: "1px solid black",
                          borderBottom: "2px solid black",
                        }}>
                        <div>
                          <strong className="text-xl font-bold">
                            총 근무 시간
                          </strong>
                        </div>
                        <div>{convertTime(salaryInfo?.totalWorkHour)}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Modal>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DateCheckPage;
