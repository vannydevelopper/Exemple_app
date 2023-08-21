function countWeekdays(startDate, endDate) {
        let currentDate = moment(startDate);
        let weekdays = 0;
    
        while (currentDate.isSameOrBefore(endDate, 'day')) {
            if (currentDate.day() !== 0 && currentDate.day() !== 6) {
                weekdays++;
            }
            currentDate.add(1, 'day');
        }
    
        return weekdays;
    }



    var dateDebutConge = moment(new Date(dateDebut))

    var dateFinConge = moment(new Date(dateFIn))

    var nombreJourRecus
    if (dateDebutConge && dateFinConge) {
            // nombreJourRecus = (dateFinConge.diff(dateDebutConge, 'days') + 1);
            nombreJourRecus = countWeekdays(dateDebutConge, dateFinConge)
    }