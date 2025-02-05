import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useMatch, useNavigate } from "react-router-dom";
import { PAYMENT } from "../constant/payment";
import ShowSalary from "./ShowSalary/ShowSalary";
import { getUser } from "../api";

export default function MainContent({ userType, currentCompany, currentUser }) {
  const navigate = useNavigate();
  const { darkMode } = useSelector((state) => state.darkmodeSlice);
  const matchCalendar = useMatch(`/${currentUser?.photoURL}/calendar`);
  const matchHome = useMatch(`/${currentUser?.photoURL}/companymain`);
  const [jobName, setJobName] = useState("");
  const [userpaytype, setUserpaytype] = useState("");

  useEffect(() => {
    async function getEmployeeInfo() {
      const data = await getUser(currentUser);

      setJobName(data.jobName);
      setUserpaytype(data.salaryType);
    }
    getEmployeeInfo();
  }, [currentUser]);

  if (userType === "admin") {
    if (window.innerWidth <= 600) {
      return (
        <div className="flex justify-center items-center">
          PC로 접속해주세요.
        </div>
      );
    } else {
      return (
        <div
          data-tour="step-1"
          className={`flex justify-center items-center h-[calc(100vh_-_18rem)] ${
            darkMode ? "border-b border-white/50" : "border-b border-black/50"
          }`}>
          <div className="relative flex items-center h-full w-full">
            <div className="flex flex-col items-center justify-center gap-7 cursor-pointer absolute left-[30%] top-[10%]">
              <div
                className="bg-gradient-to-b from-black to-transparent w-80 h-80 rounded-full"
                onClick={() =>
                  navigate(`/${currentUser?.photoURL}/employeelist`)
                }></div>
              <div className="font-black text-lg">PEOPLE</div>
              <div className="font-normal text-xs">
                직원 리스트와 요약 보기 및 정산
              </div>

              <div className="flex flex-col items-center justify-center gap-7 cursor-pointer z-9 absolute left-[65%]">
                <div
                  className="w-80 h-80 rounded-full bg-[#B8B8B84D]"
                  onClick={() =>
                    navigate(`/${currentUser?.photoURL}/datecheck`)
                  }></div>
                <div className="font-black text-lg">CALENDAR</div>
                <div className="font-normal text-xs">직원 달력 별 보기</div>

                <div
                  className="flex flex-col items-center justify-center gap-7 cursor-pointer z-10 absolute left-[65%]"
                  onClick={() => navigate(`/${currentUser?.photoURL}/setting`)}>
                  <div className="bg-gradient-to-b from-gray-300 to-transparent w-80 h-80 rounded-full "></div>
                  <div className="font-black text-lg">SETTING</div>
                  <div className="font-normal text-xs">
                    공휴일 설정 및 근태 관리
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
  } else {
    return (
      <div data-tour="step-32">
        <div className="flex flex-col gap-16">
          <div className="flex flex-col items-center gap-4">
            <img
              src={currentCompany?.companyLogo}
              alt="회사로고"
              className="rounded-full w-[130px] h-[130px]"
            />
            <div className="font-black text-base">
              {currentCompany?.companyName}
            </div>
            <div className="flex items-center text-xs">
              {currentUser?.displayName}/{jobName}
            </div>
          </div>
          <div className="flex flex-col items-center gap-4">
            <div className="h-[1px] w-full bg-white-border-sub dark:bg-dark-border-sub"></div>
            <div
              className="flex flex-row justify-between w-full items-center cursor-pointer text-sm"
              onClick={() => navigate(`/${currentUser.photoURL}/calendar`)}>
              <div>캘린더 바로가기</div>
              <div>&gt;</div>
            </div>
            <div className="h-[1px] w-full bg-white-border-sub dark:bg-dark-border-sub"></div>
            <div className="flex flex-row justify-between w-full items-center text-sm">
              <div>급여 지급/계산 방식</div>
              <div>{PAYMENT[userpaytype]}</div>
            </div>
            <div className="h-[1px] w-full bg-white-border-sub dark:bg-dark-border-sub"></div>
            <div className="w-full" data-tour="step-33">
              {userType === "employee" && (
                <ShowSalary
                  matchCalendar={matchCalendar}
                  matchHome={matchHome}
                />
              )}
            </div>
            <div className="h-[1px] w-full bg-white-border-sub dark:bg-dark-border-sub"></div>
            <div
              data-tour="step-34"
              className="cursor-pointer text-lg font-extrabold flex justify-center items-center pb-5 underline"
              onClick={() => navigate(`/${currentUser.photoURL}/camera`)}>
              QR SCAN
            </div>
          </div>
        </div>
      </div>
    );
  }
}
