import React, { useState, useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { getDatabase, get, ref, set, update, push } from "firebase/database";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Slide from "@mui/material/Slide";
import Button from "@mui/material/Button";
import { useTour } from "@reactour/tour";

function QrScan({ companyLogo }) {
  const [scanResult, setScanResult] = useState(null);
  const [scanMessage, setScanMessage] = useState(null);
  const { currentUser } = useSelector((state) => state.user);
  const companyCode = currentUser?.photoURL; // 회사 코드
  const userId = currentUser?.uid; // 유저 아이디
  const [currentCompany, setCurrentCompany] = useState();
  const [jobName, setJobName] = useState();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleCheckOutJob = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    const scanner = new Html5QrcodeScanner("reader", {
      qrbox: { width: 250, height: 250 },
      fps: 5,
    });
    async function getCompanyInfo() {
      const db = getDatabase();
      const dbRef = ref(db, `companyCode/${currentUser?.photoURL}/companyInfo`);
      const jobNameRef = ref(
        db,
        `companyCode/${currentUser?.photoURL}/users/${currentUser?.uid}/jobName`
      );
      const snapshot = await get(dbRef);
      const jobSnapshot = await get(jobNameRef);
      if (snapshot.val() && jobSnapshot.val()) {
        setCurrentCompany(snapshot.val());
        setJobName(jobSnapshot.val());
      }
    }

    scanner.render(async (result) => {
      scanner.clear();

      setScanResult(result);
      const dateStr = new Date().toString();
      const db = getDatabase();

      // 스캔할 때마다 날짜를 확인

      let date = new Date();
      const offset = date.getTimezoneOffset() * 60000;
      const now = new Date(Date.now() - offset);

      const nowStr = now.toISOString().slice(0, 10);

      const yesterdayForNow = new Date(Date.now() - offset);
      yesterdayForNow.setDate(yesterdayForNow.getDate() - 1);
      const yesterdayForNowStr = yesterdayForNow.toISOString().slice(0, 10);

      let workHours = 0;

      const dbref = ref(
        db,
        `companyCode/${companyCode}/users/${userId}/date/${nowStr}`
      );
      const workDateRef = ref(
        db,
        `companyCode/${companyCode}/users/${userId}/workDates/${nowStr}`
      );

      const prevDayRef = ref(
        db,
        `companyCode/${companyCode}/users/${userId}/date/${yesterdayForNowStr}`
      );
      const prevWorkDateRef = ref(
        db,
        `companyCode/${companyCode}/users/${userId}/workDates/${yesterdayForNowStr}`
      );

      const prevDaySnapshot = await get(prevDayRef);
      const snapshot = await get(dbref);

      if (prevDaySnapshot.exists() || snapshot.exists()) {
        if (
          //오늘 출근기록이 없고 어제 출근기록은 있는데 퇴근 기록은 없는 경우
          !snapshot.exists() &&
          prevDaySnapshot.exists() &&
          prevDaySnapshot.val().startTime &&
          !prevDaySnapshot.val().endTime
        ) {
          console.log("어제 출근기록 있음");
          await update(prevDayRef, { endTime: dateStr });
          setScanMessage("다음 날 퇴근 인증이 완료되었습니다");
          toast.success("다음 날 퇴근 인증이 완료되었습니다");
        } else if (
          //오늘 출근기록이 있을경우
          snapshot.exists() &&
          snapshot.val().startTime &&
          !snapshot.val().endTime
        ) {
          await update(dbref, { endTime: dateStr });
          setScanMessage("퇴근 인증이 완료되었습니다");
          toast.success("퇴근 인증이 완료되었습니다");
        } else if (
          //오늘 퇴근기록만 있고 출근기록은 없는 경우
          snapshot.exists() &&
          snapshot.val().endTime &&
          !snapshot.val().startTime
        ) {
          console.log("여기걸림");
          const startTime = prevDaySnapshot.val().startTime;
          const endTime = snapshot.val().endTime;
          const start = new Date(startTime);
          const end = new Date(endTime);
          workHours = Number(
            (24 - start.getHours() + end.getHours()).toFixed(1)
          );
          await set(dbref, { startTime: dateStr });
          await update(prevDayRef, { endTime: endTime });
          await update(prevWorkDateRef, {
            workHour: workHours,
          });
          await set(workDateRef, {
            workHour: 0,
            daySalary: 0,
            nightSalary: 0,
            holidayAndWeekendSalary: 0,
          });
          setScanMessage("출근 인증이 완료되었습니다");
          toast.success("출근 인증이 완료되었습니다");
        } else if (
          //오늘 기록이 없고 어제기록이 확실히 있을때 당연히 출근이지
          !snapshot.exists() &&
          prevDaySnapshot.val().startTime &&
          prevDaySnapshot.val().endTime
        ) {
          console.log("오늘기록이 없어서 이제 박는거임");
          await set(dbref, { startTime: dateStr });
          await set(workDateRef, {
            workHour: 0,
            daySalary: 0,
            nightSalary: 0,
            holidayAndWeekendSalary: 0,
          });
          setScanMessage("출근 인증이 완료되었습니다");
          toast.success("출근 인증이 완료되었습니다");
        }
      } else {
        await set(dbref, { startTime: dateStr });
        await set(workDateRef, {
          workHour: 0,
          daySalary: 0,
          nightSalary: 0,
          holidayAndWeekendSalary: 0,
        });

        setScanMessage("출근 인증이 완료되었습니다");
        toast.success("출근 인증이 완료되었습니다");
        console.log("외 안박혀;;");
      }

      if (!isOpen) {
        navigate(`/${currentUser?.photoURL}/companymain`);
      }
    });
    getCompanyInfo();
    return () => {
      setCurrentCompany([]);
    };
  }, [companyCode, userId]);

  const { isOpen, setCurrentStep, setSteps } = useTour();

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        setCurrentStep(0);
        setSteps([
          {
            selector: '[data-tour="step-35"]',
            content: `여기는 회사의 출퇴근이 이루어지는 QR SCAN 페이지 입니다.`,
          },
          {
            selector: '[data-tour="step-36"]',
            content: `QR스캔 방법을 자세히 알아보도록 할게요. 'Request Camera permissions' 버튼을 클릭해 주세요 그후, start Scanning 버튼을 클릭해주세요!`,
            action: () => {
              setTimeout(() => {
                setCurrentStep((s) => s + 1);
              }, 5000);
            },
          },
          {
            selector: '[data-tour="step-36"]',
            content: `이곳에 관리자가 부여한 QR 이미지를 스캔하시면 됩니다! 관리자가 제공한 QR 이외의 다른 QR을 스캔할 경우 오류가 발생하여 전산처리가 안됩니다. 유의해 주세요!`,
          },
          {
            selector: '[data-tour="step-37"]',
            content: `QR스캔이 정상 처리 되었다면 오른쪽 하단에 정상적으로 처리되었다는 문구가 뜹니다. 퇴근시에도 꼭 찍어주셔야 퇴근처리가 되니 유의해 주세요!`,
          },
          {
            selector: '[data-tour="step-38"]',
            content: `혹시 외근 시에 외근처리를 하셔야 한다면, QR스캔 대신 아래 버튼을 클릭해 외근 처리를 해주시면 됩니다.
외근은 관리자에게 문의 해주세요.`,
          },
          {
            selector: '[data-tour="step-31"]',
            content: `이제 위의 버튼을 클릭해 메뉴바를 열고 CALENDAR으로 이동해주세요.`,
          },
        ]);
      }, 300);

      return () => {
        clearTimeout(timer), setSteps([]);
      };
    }
  }, [isOpen, setCurrentStep, setSteps]);

  const submitOutJob = async () => {
    const db = getDatabase();
    let date = new Date();
    const offset = date.getTimezoneOffset() * 60000;
    const now = new Date(Date.now() - offset);

    const nowStr = now.toISOString().slice(0, 10);
    const nowRef = ref(
      db,
      `companyCode/${companyCode}/users/${userId}/date/${nowStr}`
    );
    const nowRef2 = ref(
      db,
      `companyCode/${companyCode}/users/${userId}/workDates/${nowStr}`
    );
    try {
      await set(nowRef, { startTime: "외근", endTime: "외근" });
      await set(nowRef2, { workHour: "외근" });
      handleClose();
      toast.success("외근 등록이 완료되었습니다.");
    } catch (e) {
      toast.error("정상적으로 기록되지 않았습니다.");
    }
  };

  return (
    <>
      <div className="flex flex-col gap-10" data-tour="step-35">
        <div className="flex flex-col items-center gap-4">
          <img
            src={companyLogo}
            alt="회사로고"
            className="rounded-full w-[130px] h-[130px]"
          />
          <div className="font-black">{currentCompany?.companyName}</div>
          <div className="flex items-center">
            {currentUser?.displayName}/{jobName}
          </div>
        </div>
        <div className="h-full w-full" data-tour="step-36">
          <div id="reader" className="p-12"></div>
        </div>
        <div
          data-tour="step-38"
          className="underline text-sm text-red-500 text-center mb-3"
          onClick={handleCheckOutJob}>
          외근 시 여기를 클릭해주세요.
        </div>
        <div
          data-tour="step-37"
          className="absolute right-0 bottom-0 w-52 h-10"></div>
      </div>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description">
        <DialogTitle>{"정말 외근으로 출근 하시는게 맞습니까?"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            금일{" "}
            {`${new Date().getFullYear()}년 ${
              new Date().getMonth() + 1
            }월 ${new Date().getDate()}일`}
            을 외근으로 출근 시 회사 출퇴근 시간이 기록되지 않습니다.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} className="text-red-500">
            취소
          </Button>
          <Button onClick={submitOutJob}>출근</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default QrScan;
