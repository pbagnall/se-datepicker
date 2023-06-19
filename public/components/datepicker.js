import '/components/popup.js';
import { getShortcut } from '/lib/keyboard.js';

const datePickerTemplate = document.createElement('template');
datePickerTemplate.innerHTML = `
    <style>
        div.datepicker {
            display: inline-flex;
            box-sizing: border-box;
            border: 1px solid #888888;
            border-radius: 0.1875rem;
            height: 1.5rem;
            font-family: Avenir, sans-serif;
        }

        input.field {
            border: none;
            border-radius: 0.125rem 0 0 0.125rem;
            background-color: lightyellow;
            height: 1.25rem;
            vertical-align: bottom;
            margin: 0;
            width: 4.5rem;
        }
        
        input.field:focus,
        button.trigger:focus {
            outline: none;
        }

        div.datepicker:has(input.field:focus),
        div.datepicker:has(button.trigger:focus) {
            outline: Highlight auto 2px ;
            outline: -webkit-focus-ring-color auto 2px;
        }

        button.trigger {
            font-family: Avenir, sans-serif;
            background-color: #eeeeee;
            border: none;
            border-radius: 0 0.125rem 0.125rem 0;
            margin: 0;
            height: 1.375rem;
            vertical-align: bottom;
        }
        
        div.datepicker:hover button.trigger        { background-color: #cccccc; }
        div.datepicker       button.trigger:active { background-color: #aaaaaa; }
    </style>
    <div class='datepicker' id='date-picker'>
    <input class='field' type='text' value='no selection' /><button tabindex=0 class='trigger'>C</button>
    </div>
`;

const dialogTemplate = document.createElement('template');
dialogTemplate.innerHTML = `
   <style id='popup'>
      #container {
          --datepicker-oddPeriodBackground: var(--oddPeriodBackground, #eaeaea);
          --datepicker-evenPeriodBackground: var(--evenPeriodBackground, #ffffff);
          --datepicker-toolbarBackground: var(--toolbarBackground, #d0d0d0);
          --datepicker-foreground: var(--foreground, #000000);
          --datepicker-hoverColor: var(--hoverColor, #ffffff);
          --datepicker-hoverBackgroundColor: var(--hoverBackgroundColor, #ff000080);
          --datepicker-selectedColor: var(--selectedColor, #ffffff);
          --datepicker-selectedBackgroundColor: var(--selectedBackgroundColor, #ff0000);
          --datepicker-todayBorderColor: var(--todayBorderColor, orange);

          top: 2rem;
          height: 16rem;
          color: var(--datepicker-foreground);
          overflow: auto;
          scrollbar-width: none;
          font-size: 0.8em;
          font-family: Avenir, sans-serif;
      }

      #container::-webkit-scrollbar {
         width: 0;
         background: transparent;
      }
      
      se-popup {
         --padding: 0;
      }
      
      se-popup::-webkit-scrollbar {
         background: transparent;
         width: 0;
      }
      
      se-popup table {
         position: relative;
         border-spacing: 0;
         border-collapse: collapse;
         margin: 0;
      }
      
      se-popup thead,
      se-popup tfoot {
         position: sticky;
         top: 0;
         background-color: var(--datepicker-toolbarBackground);
         padding: 0;
         margin: 0;
         z-index: 1;
      }
      
      se-popup thead button,
      se-popup tfoot button {
        height: 1.1rem;
        font-family: Avenir, sans-serif;
        font-size: 0.8rem;
      }
      
      se-popup tfoot {
         bottom: 0;      
      }

      se-popup th.month, 
      se-popup th.year {
         vertical-align: top;
         position: relative;
      }
      
      se-popup th.month span,
      se-popup th.year span {
         position: sticky;
         top: 1.5rem;
         writing-mode: vertical-lr;
         text-orientation: sideways;
         padding: 3px;
      } 
      
      se-popup tr.oddPeriod,
      se-popup td.oddPeriod, 
      se-popup th.oddPeriod {
          background-color: var(--datepicker-oddPeriodBackground);      
      }

      se-popup tr.evenPeriod,
      se-popup td.evenPeriod,
      se-popup th.evenPeriod {
          background-color: var(--datepicker-evenPeriodBackground);      
      }
      
      se-popup td {
          padding: 2px;
          margin-left: 2px;
          text-align: center;
          min-width: 2.2em;
      }
      
      se-popup td span {
          display: inline-block;
          width: calc(100% - 4px);
          border-radius: 40px;
          border-color: transparent;
      }

      se-popup td:hover span {
          color: var(--datepicker-hoverColor);
          background-color: var(--datepicker-hoverBackgroundColor);
      }
      
      se-popup td.selected span {
          color: var(--datepicker-selectedColor);
          background-color: var(--datepicker-selectedBackgroundColor);
      }
      
      se-popup td.today span {
          border: 2px solid var(--datepicker-todayBorderColor);
          padding: 0;
          margin: 0;
      }
   </style>
   <se-popup anchor='date-picker' anchor-direction='se,sw,ne,nw,em,wm'>
      <div id='container'>
         <table>
            <thead>
               <tr>
                  <th scope='col'>Mon</th>
                  <th scope='col'>Tue</th>
                  <th scope='col'>Wed</th>
                  <th scope='col'>Thu</th>
                  <th scope='col'>Fri</th>
                  <th scope='col'>Sat</th>
                  <th scope='col'>Sun</th>
                  <td><button id='backmonth' data-direction="back" data-unit="month">^</button></td>
                  <td><button id='backyear' data-direction="back" data-unit="year">^</button></td>
               </tr>
            </thead>
            <tfoot>
               <tr>
                  <td></td>
                  <td></td>
                  <th></th>
                  <th></th>
                  <th></th>
                  <th></th>
                  <th></th>
                  <td><button id='forwardmonth' data-direction="forward" data-unit="month">v</button></td>
                  <td><button id='forwardyear' data-direction="forward" data-unit="year">v</button></td>
               </tr>
            </tfoot>
            <tbody>
            </tbody>
      </table>
      </div>
   </se-popup>
`;

class DatePicker extends HTMLElement {
   constructor() {
      super();
      this.attachShadow({mode: 'open'});
      this.shadowRoot.append(datePickerTemplate.content.cloneNode(true));

      this.input = this.shadowRoot.querySelector("input.field");
      this.trigger = this.shadowRoot.querySelector("button.trigger");
      this.scrolled = () => this.scrolledDialog();
      this.popupOpened = () => this.popupOpenedHandler();
      this.popupClosed = () => this.popupClosedHandler();
      this.keyboardHandler = (e) => this.keyboard(e);

      this.dateValue = dayjs(this.attributes['date'].value);
      if (isNaN(this.dateValue.valueOf())) {
         this.dateValue = dayjs();
      }
      this.input.value = this.dateValue.format("DD MMM YYYY");

      this.trigger.addEventListener('click', () => this.triggerClicked());
      this.popupIsOpen = false;

      if (this.hasAttribute('open')) {
         this.openDatePicker();
      }
   }

   triggerClicked() {
      if (this.popupIsOpen) {
         this.closeDatePicker();
      } else {
         this.openDatePicker();
      }
   }

   openDatePicker() {
      const quickButtons = (e) => this.quickButtons(e);

      this.shadowRoot.appendChild(dialogTemplate.content.cloneNode(true));
      this.popupIsOpen = true;
      this.popup = this.shadowRoot.querySelector("se-popup");
      this.dialog = this.shadowRoot.querySelector("#container");
      this.dialog.addEventListener('scroll', this.scrolled);
      this.input = this.shadowRoot.querySelector("input.field");

      this.trigger.addEventListener("keydown", this.keyboardHandler);
      this.trigger.focus();

      const upMonth = this.shadowRoot.getElementById('backmonth');
      const upYear = this.shadowRoot.getElementById('backyear');
      const downMonth = this.shadowRoot.getElementById('forwardmonth');
      const downYear = this.shadowRoot.getElementById('forwardyear');
      upMonth.addEventListener("click", quickButtons);
      upYear.addEventListener("click", quickButtons);
      downMonth.addEventListener("click", quickButtons);
      downYear.addEventListener("click", quickButtons);

      this.populateCalendar();
      this.popup.addEventListener("open", this.popupOpened);
      this.popup.addEventListener("close", this.popupClosed);
      this.popup.open();
   }

   keyboardCommands = {
      // move by 1 day or 1 week
      "ArrowDown":    { type: 'delta', delta: 7 },
      "ArrowUp":      { type: 'delta', delta: -7 },
      "ArrowLeft":    { type: 'delta', delta: -1 },
      "ArrowRight":   { type: 'delta', delta: 1 },

      // this should jump by ~one month, preserving day of week, 4 or 5 weeks
      "C-ArrowDown":  { type: "month", direction: 1 },
      "C-ArrowUp":    { type: "month", direction: -1 },

      // this jumps by ~1 year, preserving day of the week. 52 weeks
      "PageUp":       { type: 'delta', delta: -364 },
      "PageDown":     { type: 'delta', delta: 364 },

      // move to start or end of week
      "C-ArrowLeft":  { type: "day", day: 1 },
      "C-ArrowRight": { type: "day", day: 7 },
      "Home":         { type: "day", day: 1 },
      "End":          { type: "day", day: 7 },

      // commit the date and close the popup
      "Enter":        { type: "commit" },

      // cancel the change and close the popup
      "Escape":       { type: "cancel" }
   };

   keyboard(event) {
      event.preventDefault();
      const command = this.keyboardCommands[getShortcut(event)];
      if (typeof command === 'undefined') return;

      this.action(command);
   }
   
   action(command) {
      const tbody = this.dialog.querySelector("tbody");
      this.highlightDate(tbody, this.dateValue, false);

      switch (command.type) {
         case "delta":
            this.dateValue = this.dateValue.add(command.delta, 'day');
            break;
         case "day":
            if (this.dateValue.day()===0) this.dateValue = this.dateValue.subtract(1, 'day');
            this.dateValue =  this.dateValue.day(command.day);
            break;
         case "month":
            const fourWeeks = this.dateValue.add(4 * command.direction, "week");
            const fiveWeeks = this.dateValue.add(5 * command.direction, "week");
            const fourDiff = Math.abs(this.dateValue.date() - fourWeeks.date());
            const fiveDiff = Math.abs(this.dateValue.date() - fiveWeeks.date());
            this.dateValue = fourDiff < fiveDiff ? fourWeeks : fiveWeeks;
            break;
         case "commit":
            this.closeDatePicker();
            this.fireDateChangeEvent(this.dateValue, true);
            return;
         case "cancel":
            // TODO: not actually cancelling. Need to record initial value.
            this.closeDatePicker();
            this.fireDateChangeEvent(this.dateValue, true);
            return;
      }

      const earliestDate = dayjs(tbody.firstElementChild.dataset['beginning']);
      const weeksIn = this.dateValue.diff(earliestDate, 'week');
      const weeksToAddAtEnd = weeksIn - (tbody.children.length/2);

      if (weeksToAddAtEnd < 0) {
         this.addWeeksAtStart(-weeksToAddAtEnd);
         this.removeLastNWeeks(-weeksToAddAtEnd);
      } else if (weeksToAddAtEnd > 0) {
         this.addWeeksAtEnd(weeksToAddAtEnd);
         this.removeFirstNWeeks(weeksToAddAtEnd);
      }

      // TODO: make this preserve the position of the selection in the dialog
      this.scrollToDate(this.dateValue);

      this.highlightDate(tbody, this.dateValue, true);
      this.fireDateChangeEvent(this.dateValue, false);
   }

   getSelectionWeek(tbody, date) {
      const week = date.day() === 0 ? date.subtract(6, 'day') : date.day(1);
      const selector = `tr[data-beginning=\"${week.format('YYYY-MM-DD')}\"]`;
      return tbody.querySelector(selector);
   }

   highlightDate(tbody, date, show) {
      const weekElem = this.getSelectionWeek(tbody, date);

      // for dateValue monday = 1, sunday = 0
      // item is zero based, so monday needs to be 0, sunday = 6
      const dayElem = weekElem.children.item((date.day()+6) % 7);
      if (show) {
         dayElem.classList.add("selected");
      } else {
         dayElem.classList.remove("selected");
      }
   }

   buttonCommands = {
      // this should jump by ~one month, preserving day of week, 4 or 5 weeks
      "forwardmonth": { type: "month", direction: 1 },
      "backmonth":    { type: "month", direction: -1 },

      // this jumps by ~1 year, preserving day of the week. 52 weeks
      "backyear":     { type: 'delta', delta: -364 },
      "forwardyear":  { type: 'delta', delta: 364 },
   }

   quickButtons(event) {
      let command = this.buttonCommands[event.target.id];
      if (!command) return;
      this.action(command);
   }

   addPeriodMarker(period, parent, row, startDate) {
      const params = {
         month: ["M", "YYYYMM", "MMM", "month"],
         year: ["Y", "YYYY", "YYYY", "year"]
      }
      const [ idprefix, idformat, format, klass ] = params[period];
      const periodMarker = parent.querySelector("#"+idprefix+startDate.format(idformat));

      // Does the period marker already exist?
      // If so
      if (periodMarker) {
         if (periodMarker.parentElement.dataset['beginning'] > row.dataset['beginning']) {
            row.appendChild(periodMarker);
         }
         periodMarker.rowSpan++;
      } else {
         const periodMarkerCell = document.createElement("th");
         periodMarkerCell.id = idprefix+startDate.format(idformat);
         periodMarkerCell.classList.add(klass);
         if (period === "month") {
            periodMarkerCell.classList.add(startDate.month() % 2 === 0 ? "oddPeriod" : "evenPeriod");
         } else { // period == year
            periodMarkerCell.classList.add(startDate.year() % 2 === 0 ? "evenPeriod" : "oddPeriod");
         }
         const span = document.createElement('span');
         span.appendChild(document.createTextNode(startDate.format(format)));
         periodMarkerCell.appendChild(span);
         row.appendChild(periodMarkerCell);
      }
   }

   buildWeek(tbody, startDate) {
      const row = document.createElement("tr");
      const today = dayjs();
      const startMonth = startDate.month();
      row.classList.add(startMonth % 2 === 0 ? "oddPeriod" : "evenPeriod");
      row.dataset['beginning'] = startDate.format('YYYY-MM-DD');

      let weekday = startDate;
      for (let day=0; day<7; day++) {
         const cell = document.createElement("td");
         if (weekday.isSame(today, 'day')) cell.classList.add("today");
         if (weekday.isSame(this.dateValue, 'day')) cell.classList.add("selected");
         if (weekday.month() !== startDate.month()) {
            cell.classList.add(weekday.month() % 2 === 0 ? "oddPeriod" : "evenPeriod");
         }

         const span = document.createElement("span");
         span.appendChild(document.createTextNode(weekday.format('D')));
         cell.appendChild(span);
         row.appendChild(cell);
         weekday = weekday.add(1, 'day');
      }

      const endOfWeek = startDate.add(6, 'day');
      this.addPeriodMarker('month', tbody, row, endOfWeek);
      this.addPeriodMarker('year', tbody, row, endOfWeek);
      return row;
   }

   addWeeksAtStart(weeks) {
      const tbody = this.dialog.querySelector("tbody");
      let first = tbody.firstElementChild;
      let startDate = dayjs(first.dataset['beginning']).subtract(7, 'day');
      let scrollBy = 0;

      for (let i=0; i<weeks; i++) {
         const row = this.buildWeek(tbody, startDate);
         tbody.insertBefore(row, first);
         first = row;
         startDate = startDate.subtract(7, 'day');
         scrollBy += first.getBoundingClientRect().height;
      }

      this.dialog.scrollBy(0, scrollBy);
   }

   addWeeksAtEnd(weeks, startDate) {
      const tbody = this.dialog.querySelector("tbody");
      if (typeof startDate === 'undefined') {
         startDate = dayjs(tbody.lastElementChild.dataset['beginning']).add(7, 'day');
      }
      startDate = startDate.day(1);

      for (let i=0; i<weeks; i++) {
         const row = this.buildWeek(tbody, startDate);
         tbody.appendChild(row);
         startDate = startDate.add(7, 'day');
      }
   }

   removeFirstNWeeks(number) {
      const parent = this.dialog.querySelector("tbody");
      let scrollBy = 0;

      for (let i=0; i<number; i++) {
         const row = parent.firstElementChild;
         const month = row.querySelector('th');
         const year = month.nextSibling;
         const nextRow = row.nextSibling;

         // move month label to next row if appropriate
         if (month && month.rowSpan > 1) {
            month.rowSpan--;
            nextRow.appendChild(month);
         } else if (month) {
            // this ensures measuring the row height doesn't get
            // thrown off by the month and date columns
            // which may be taller if the text is rotated.
            row.removeChild(month);
         }

         // move year label to next row if appropriate
         if (year && year.rowSpan > 1) {
            year.rowSpan--;
            nextRow.appendChild(year);
         } else if (year) {
            row.removeChild(year);
         }

         const height = row.firstElementChild.getBoundingClientRect().height;
         parent.removeChild(row);
         scrollBy -= height;
      }

      this.dialog.scrollBy(0, scrollBy);
   }

   removeLastNWeeks(number) {
      const parent = this.dialog.querySelector("tbody");

      for (let i=0; i<number; i++) {
         const row = parent.lastElementChild;
         const startDate = dayjs(row.dataset['beginning']);

         const selector = `#M${startDate.format("YYYYMM")}`;
         const monthStartCell = parent.querySelector(selector);
         if (monthStartCell && monthStartCell !== row) {
            monthStartCell.rowSpan--;
         }

         const yearselector = `#Y${startDate.format("YYYY")}`;
         const yearStartCell = parent.querySelector(yearselector);
         if (yearStartCell && yearStartCell !== row) {
            yearStartCell.rowSpan--;
         }

         parent.removeChild(row);
      }
   }

   scrolledDialog() {
      const dialogHeight = this.dialog.getBoundingClientRect().height;
      const tableHeight = this.dialog.querySelector("table").getBoundingClientRect().height;
      const scroll = this.dialog.scrollTop;
      const bottomProximity = tableHeight - dialogHeight - scroll;

      requestAnimationFrame(() => {
         if (bottomProximity < dialogHeight * 2) {
            this.addWeeksAtEnd(26);
            this.removeFirstNWeeks(26);
         } else if (scroll < dialogHeight * 2) {
            this.addWeeksAtStart(26);
            this.removeLastNWeeks(26);
         }
      });
   }

   populateCalendar() {
      const tablebody = this.dialog.querySelector("tbody");
      tablebody.addEventListener("click", (e) => this.clickDate(e));
      const startDate = this.dateValue.subtract(52, 'week').date(1);
      this.addWeeksAtEnd(104, startDate);
   }

   popupOpenedHandler() {
      this.scrollToDate(this.dateValue);
   }

   popupClosedHandler() {
      this.tidyUpAfterClose();
   }

   scrollToDate(date) {
      const beginning = date.day(1).format("YYYY-MM-DD");
      const dialogRect = this.dialog.getBoundingClientRect();
      const tableRect = this.dialog.querySelector("table").getBoundingClientRect();
      const weekRect = this.dialog.querySelector(`[data-beginning='${beginning}']`).getBoundingClientRect();
      this.dialog.scrollTop = weekRect.top - tableRect.top - dialogRect.height/2 + weekRect.height/2;
   }

   closeDatePicker() {
      this.popup.close();
   }

   tidyUpAfterClose() {
      this.trigger.removeEventListener("keydown", this.keyboardHandler);
      this.dialog = null;
      const popup = this.shadowRoot.querySelector("se-popup");
      const popupStyle=this.shadowRoot.querySelector("style#popup");
      popup.parentNode.removeChild(popup);
      popupStyle.parentNode.removeChild(popupStyle);
      this.popupIsOpen = false;
   }

   getEventElementAndDate(event) {
      if (event.target.tagName !== 'SPAN' && event.target.tagName !== 'TD') return null;
      const target =  event.target.tagName === 'SPAN' ? event.target.parentElement : event.target;
      if (target.tagName !== 'TD') return null;

      const week = target.parentElement.dataset['beginning'];
      let date = dayjs(week);
      if (date.date() > event.target.textContent) {
         date = date.month(date.month() + 1);
      }
      date = date.date(event.target.textContent);
      return { element: target, date: date };
   }

   clickDate(event) {
      const eventData = this.getEventElementAndDate(event);
      if (eventData === null) return;
      const { element, date } = eventData;

      if (this.activeElement) this.activeElement.classList.remove('selected');
      this.value = date;
      this.activeElement = element;
      element.classList.add('selected');

      if (!this.dateValue.isSame(date, 'day')) {
         this.dateValue = date;
         this.fireDateChangeEvent(date, true);
         this.closeDatePicker();
      }
   }

   fireDateChangeEvent(date, final) {
      this.input.value = date.format("DD MMM YYYY");
      const dateChangedEvent = new Event("change");
      dateChangedEvent.final = final;
      dateChangedEvent.value = this.dateValue.format('YYYY-MM-DD');
      this.dispatchEvent(dateChangedEvent);
   }
}
window.customElements.define('se-datepicker', DatePicker);
