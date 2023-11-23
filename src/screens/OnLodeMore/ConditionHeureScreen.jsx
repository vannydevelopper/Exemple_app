
//por comparer les heures avec moment
moment(new Date()).get("hours")>=17 && moment(new Date()).get("hours")<=23 ?
<AddButton isForCra={true} affectation={affectation} />:null

//por recuperer les dates cotes backend
const date = moment(new Date()).format("YYYY-MM-DD HH:mm:ss")

//condition pour comparer les jour de semaines en excluant les weekends
function countWeekdays(startDate, endDate) {
        let currentDate = moment(startDate);
        let weekdays = 0;

        while (currentDate.isSameOrBefore(endDate, 'day')) {
                  if (currentDate.day() !== 0 && currentDate.day() !== 6) {
                            weekdays++;
                  }
                  currentDate.add(1, 'day');
        }

        return weekdays;
}

//fonction pour comparer les jours de semaines en tilisant memes des heures
function countWorkingHours(startDate, endDate) {
        const startDateTime = moment(startDate);
        const endDateTime = moment(endDate);

        let currentDateTime = moment(startDateTime);
        let workingHours = 0;

        while (currentDateTime.isSameOrBefore(endDateTime)) {
                  const currentDayOfWeek = currentDateTime.day();
                  const currentHour = currentDateTime.hour();

                  if (currentDayOfWeek >= 1 && currentDayOfWeek <= 5 && currentHour >= 9 && currentHour < 17) {
                            workingHours++;
                  }

                  currentDateTime.add(1, 'hour');
        }

        return workingHours;
}

var dateDebutConge = moment(new Date(dateDebut))

var dateFinConge = moment(new Date(dateFIn))

var nombreJourRecus, nombreHeuresRecus
if (dateDebutConge && dateFinConge) {
          // nombreJourRecus = (dateFinConge.diff(dateDebutConge, 'days') + 1);
          nombreHeuresRecus = countWorkingHours(moment(dateDebut).set({ hour: moment(heureDebut).get('hour'), minute: moment(heureDebut).get('minute') }), moment(dateFIn).set({ hour: moment(heureFIn).get('hour'), minute: moment(heureFIn).get('minute') }))
          //       nombreJourRecus =( (countWeekdays(dateDebutConge, dateFinConge)-1) + nombreHeuresRecus/8).toFixed(1)
          nombreJourRecus = (nombreHeuresRecus / 8).toFixed(1)
}