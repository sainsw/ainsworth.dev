#!/usr/bin/env node

// Test the pride date logic
function testPrideDates() {
  console.log('🏳️‍🌈 Testing Pride Date Logic for 2025\n');

  // Test function mimicking the component logic
  function isPrideTime(testDate) {
    const now = new Date(testDate);
    const month = now.getMonth() + 1;
    const date = now.getDate();
    
    // Pride Month - entire June
    if (month === 6) {
      return { isPride: true, reason: 'Pride Month (June)' };
    }
    
    // Manchester Pride - week leading up to August bank holiday
    if (month === 8) {
      const year = now.getFullYear();
      
      // Find the last Monday of August
      const lastDayOfMonth = new Date(year, 8, 0).getDate();
      let lastMonday = lastDayOfMonth;
      const lastDayWeekday = new Date(year, 7, lastDayOfMonth).getDay();
      
      if (lastDayWeekday === 1) {
        lastMonday = lastDayOfMonth;
      } else {
        lastMonday = lastDayOfMonth - ((lastDayWeekday + 6) % 7);
      }
      
      // Week before through bank holiday Monday
      const prideWeekStart = lastMonday - 7;
      const prideWeekEnd = lastMonday;
      const adjustedStart = Math.max(1, prideWeekStart);
      
      if (date >= adjustedStart && date <= prideWeekEnd) {
        return { 
          isPride: true, 
          reason: `Manchester Pride week (Aug ${adjustedStart}-${prideWeekEnd}, bank holiday Mon ${lastMonday})` 
        };
      }
    }
    
    return { isPride: false, reason: 'Not pride time' };
  }

  // Test dates for 2025
  const testDates = [
    '2025-06-01', // Pride Month start
    '2025-06-15', // Mid Pride Month
    '2025-06-30', // Pride Month end
    '2025-07-01', // Day after Pride Month
    '2025-08-17', // Day before Manchester Pride week
    '2025-08-18', // Manchester Pride week start
    '2025-08-22', // Mid Manchester Pride week
    '2025-08-25', // Bank Holiday Monday
    '2025-08-26', // Day after bank holiday
    '2025-12-25', // Random date (Christmas)
  ];

  testDates.forEach(dateStr => {
    const result = isPrideTime(dateStr);
    const date = new Date(dateStr);
    const dayName = date.toLocaleDateString('en-GB', { weekday: 'long' });
    
    console.log(`${dateStr} (${dayName}): ${result.isPride ? '🏳️‍🌈 YES' : '❌ NO'} - ${result.reason}`);
  });

  console.log('\n✨ For 2025:');
  console.log('🏳️‍🌈 Pride borders active:');
  console.log('   • June 1-30 (Pride Month)');
  console.log('   • August 18-25 (Manchester Pride week + bank holiday)');
}

testPrideDates();