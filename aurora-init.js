import { Aurora } from './aurora.js';

document.addEventListener('DOMContentLoaded', function() {
  const container = document.getElementById('aurora-background');
  
  if (container) {
    const aurora = new Aurora(container, {
      colorStops: ["#3A29FF", "#FF94B4", "#FF3232"],
      amplitude: 1.0,
      blend: 0.5,
      speed: 0.5
    });

    // Make aurora globally accessible for potential future updates
    window.aurora = aurora;
  }
});