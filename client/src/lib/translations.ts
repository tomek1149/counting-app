export type Language = 'en' | 'pl';

export const translations = {
  en: {
    common: {
      rate: "Rate",
      startTime: "Start Time",
      endTime: "End Time",
      hourlyRate: "Hourly Rate",
      submit: "Submit",
      save: "Save",
      delete: "Delete",
      loading: "Loading...",
      success: "Success",
      error: "Error",
    },
    home: {
      title: "Time Tracking & Earnings",
      setRate: "Set Rate",
      saveHours: "Save Hours",
      createTodaySession: "Create Today's Session",
    },
    timer: {
      start: "Start Timer",
      stop: "Stop Timer",
      setRateFirst: "Please set an hourly rate first",
    },
    summary: {
      title: "Summary",
      totalHours: "Total Hours",
      totalEarnings: "Total Earnings",
    },
    sessions: {
      title: "Sessions",
      noSessions: "No sessions found",
      rate: "Rate",
      ongoing: "Ongoing",
    },
    historical: {
      title: "Add Historical Session",
      date: "Date",
      sessionsOn: "Sessions on",
      totalForDay: "Total for day",
      addSession: "Add Historical Session",
    },
  },
  pl: {
    common: {
      rate: "Stawka",
      startTime: "Czas rozpoczęcia",
      endTime: "Czas zakończenia",
      hourlyRate: "Stawka godzinowa",
      submit: "Zatwierdź",
      save: "Zapisz",
      delete: "Usuń",
      loading: "Ładowanie...",
      success: "Sukces",
      error: "Błąd",
    },
    home: {
      title: "Śledzenie Czasu i Zarobków",
      setRate: "Ustaw stawkę",
      saveHours: "Zapisz godziny",
      createTodaySession: "Utwórz sesję na dziś",
    },
    timer: {
      start: "Rozpocznij",
      stop: "Zatrzymaj",
      setRateFirst: "Najpierw ustaw stawkę godzinową",
    },
    summary: {
      title: "Podsumowanie",
      totalHours: "Całkowity czas",
      totalEarnings: "Całkowity zarobek",
    },
    sessions: {
      title: "Sesje",
      noSessions: "Brak sesji",
      rate: "Stawka",
      ongoing: "W trakcie",
    },
    historical: {
      title: "Dodaj historyczną sesję",
      date: "Data",
      sessionsOn: "Sesje z dnia",
      totalForDay: "Suma za dzień",
      addSession: "Dodaj historyczną sesję",
    },
  },
};

export type TranslationKey = keyof typeof translations.en;
