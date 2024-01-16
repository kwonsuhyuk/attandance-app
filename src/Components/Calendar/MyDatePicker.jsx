import DatePicker from 'react-datepicker';
import { useState } from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import { db } from '../../firebase/index.js';

const MyDatePicker = () => {
  const [selectedHolidays, setSelectedHolidays] = useState([]);
  const companyCode = 'companyCode'; // 회사 코드

  const handleDateChange = (date) => {
    setSelectedHolidays((prevHolidays) => [...prevHolidays, date]);

    const dateStr = date.toISOString().substring(0, 10);
    db.ref(`/${companyCode}/companyInfo`)
      .set({
        isHoliday: {
          [dateStr]: true,
        },
      })
      .then(() => {
        console.log('공휴일 정보가 성공적으로 저장되었습니다.');
      })
      .catch((error) => {
        console.error('공휴일 정보 저장에 실패했습니다: ', error);
      });
  };

  return (
    <DatePicker
      dateFormat='yyyy.MM.dd'
      shouldCloseOnSelect
      minDate={new Date('2000-01-01')}
      maxDate={new Date()}
      onChange={handleDateChange}
      inline
    />
  );
};

export default MyDatePicker;
