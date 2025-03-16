document.addEventListener('DOMContentLoaded', () => {
  const settingsToggle = document.querySelector('.settings-toggle');
  const settingsContent = document.querySelector('.settings-content');
  const themeButtons = document.querySelectorAll('.theme-btn');
  const customColorSlider = document.getElementById('customColor');
  const actionButtons = document.querySelectorAll('.action-btn');
  const output = document.getElementById('output');

  // Toggle settings drawer
  settingsToggle.addEventListener('click', () => {
    settingsContent.style.display = settingsContent.style.display === 'block' ? 'none' : 'block';
  });

  // Theme button functionality
  themeButtons.forEach(button => {
    button.addEventListener('click', () => {
      const theme = button.dataset.theme;
      document.body.className = `theme-${theme}`;
    });
  });

  // Custom color slider functionality
  customColorSlider.addEventListener('input', () => {
    const hue = customColorSlider.value;
    document.body.style.setProperty('--primary', `hsla(${hue}, 73%, 59%, 1)`);
    document.body.style.setProperty('--primary-light', `hsla(${hue}, 73%, 71%, 1)`);
    document.body.style.setProperty('--primary-dark', `hsla(${hue}, 73%, 47%, 1)`);
    document.body.classList.remove('theme-pink', 'theme-green', 'theme-blue', 'theme-orange', 'theme-neutral');
  });

  // Action button functionality with Netlify Function
  actionButtons.forEach(button => {
    button.addEventListener('click', async () => {
      const type = button.dataset.type;
      const url = document.getElementById('video-url').value;
      console.log('Button clicked:', type, 'URL:', url); // Debug log

      if (!url) {
        output.innerHTML = '<p>Please enter a video URL.</p>';
        return;
      }

      // Extract video ID from YouTube URL
      const videoIdMatch = url.match(/(?:youtube\.com\/(?:[^/]+\/[^/]+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/);
      if (!videoIdMatch) {
        output.innerHTML = '<p>Invalid YouTube URL. Please provide a valid URL.</p>';
        return;
      }
      const videoId = videoIdMatch[1];
      console.log('Extracted Video ID:', videoId); // Debug log

      try {
        // Commenting out direct API call
        // const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${process.env.YOUTUBE_API_KEY}`;
        // const response = await fetch(apiUrl);
        // console.log('Response status:', response.status);

        // New fetch call to Netlify Function
        const functionResponse = await fetch(`/.netlify/functions/fetch-video?videoId=${videoId}`);
        console.log('Function Response status:', functionResponse.status); // Debug log
        const data = await functionResponse.json();
        console.log('Function API Response:', data); // Debug log

        if (data.error) {
          output.innerHTML = `<p>Error: ${data.error}</p>`;
          return;
        }

        if (!data.items || data.items.length === 0) {
          output.innerHTML = '<p>No video data found for this URL.</p>';
          return;
        }

        const snippet = data.items[0].snippet;
        let result;

        switch (type) {
          case 'guide':
            const steps = snippet.description.split('.').filter(step => step.trim()).slice(0, 5).map((step, index) => `${index + 1}. ${step.trim()}.`);
            result = `Guide: Steps for "${snippet.title}":\n${steps.join('\n')}`;
            break;
          case 'tools':
            const toolsMatch = snippet.description.match(/\b(tool|hammer|screwdriver|drill)\b/gi);
            result = `Tools: Potential tools in "${snippet.title}" include: ${toolsMatch ? toolsMatch.join(', ') : 'None detected.'}`;
            break;
          case 'summary':
            result = `Summary: "${snippet.title}" - ${snippet.description.slice(0, 200)}...`;
            break;
          default:
            result = 'Invalid option selected.';
        }

        output.innerHTML = `<h2>${type.charAt(0).toUpperCase() + type.slice(1)}</h2><p>${result}</p>`;
      } catch (error) {
        console.error('Fetch error:', error); // Debug log
        output.innerHTML = `<p>Error fetching video data: ${error.message}</p>`;
      }
    });
  });
});