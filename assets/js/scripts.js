'use strict';
; (function (window, document, undefined) {
  const purchasedEuro = 100;
  const $dateInput = document.querySelector('input[type="datetime-local"]');
  const $tableBody = document.querySelector('table[data-id="tableResult"] tbody');
  const $form = document.querySelector('form[data-id="formDateTime"]');

  const getBitcoinValue = async (date) => {
    const baseUrl = 'https://api.coingecko.com/api/v3/coins/bitcoin/';
    const isDateGreaterThanNow = isDateGreaterThan(date, new Date());
    const dateReverse = date && date.substring(0, 10).split('-').reverse().join('-');
    const queryDate = dateReverse && !isDateGreaterThanNow ? `history?date=${dateReverse}` : '';

    const response = await fetch(baseUrl + queryDate);
    const data = await response.json();

    return data.market_data.current_price.eur;
  }

  const isDateGreaterThan = (date, currentDate) => {
    const inputDate = new Date(date);
    return inputDate > currentDate;
  }

  const convertBtcToEur = async (purchasedEuro, date) => {
    const bitcoinOnDate = await getBitcoinValue(date)
      .then(data => data)
      .catch(err => console.log(err.message));

    const bitcoinNow = await getBitcoinValue()
      .then(data => data)
      .catch(err => console.log(err.message));

    const percentageBetween = ((bitcoinNow - bitcoinOnDate) / bitcoinOnDate * 100);
    const result = ((percentageBetween / 100) * purchasedEuro) + purchasedEuro;

    return result;
  }

  const getNextLottoDraw = (date) => {
    const dayOfWeek = date.getDay();
    const hour = date.getHours();

    const getNextDrawDay = (dayOfWeek, hour) => {
      if (dayOfWeek < 3) return 3

      if (dayOfWeek === 3) {
        if (hour < 20) return 3
        return 6
      }

      if (dayOfWeek > 3) {
        if (dayOfWeek === 6 && hour > 19) return 3
        return 6
      }
    }

    let nextDrawDay = getNextDrawDay(dayOfWeek, hour);
    let nextDrawDate = date;

    nextDrawDate.setDate(date.getDate() + ((7 - date.getDay()) % 7 + nextDrawDay) % 7);

    return nextDrawDate;
  }

  const nextDrawDateStr = (date) => {
    if (date instanceof Date) {
      return `${date.toISOString().substring(0, 10)} 20:00`;
    }
  }

  const addTableRow = (date, amount) => {
    $tableBody.innerHTML += `
      <tr>
        <td>${date}</td>
        <td>€ ${amount}</td>
      </tr>
    `
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const date = $form.elements['form-date'].value;

    const nextLottoDraw = nextDrawDateStr(getNextLottoDraw(new Date(date)));
    const bitcoinValue = await convertBtcToEur(purchasedEuro, date);

    addTableRow(nextLottoDraw, bitcoinValue.toFixed(2));
  }

  $dateInput.value = new Date().toISOString().substring(0, 16);
  $form.addEventListener('submit', handleSubmit);

})(window, document)


