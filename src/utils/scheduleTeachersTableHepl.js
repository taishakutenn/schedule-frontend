  // Filter - only monday
  export function isMonday(dateToCheck) {
    if (!dateToCheck) return false;
    return dateToCheck.getDay() === 1;
  }