document.addEventListener('DOMContentLoaded', () => {
  const talkVideo = document.getElementById('talk-video');
  const idleVideo = document.getElementById('idle-video');
  const chatMessages = document.getElementById('chat-messages');
  const userInput = document.getElementById('user-input-field');
  const enterButton = document.getElementById('enter-button');
  const muteBtn = document.getElementById('muteBtn');
  const typingIndicator = document.getElementById('typing-indicator');

  let onboardingStep = 0;  // 0: greet, 1: zip, 2: phone, 3: start, 4+: general
  let soundEnabled = false;
  let aiSpeaking = false;

  const videos = {
    greeting: '/videos/Greetings.mp4',
    idle: '/videos/idle.mp4',
    zip: '/videos/Zip code.mp4',
    phone: '/videos/phone.mp4',
    start: '/videos/Start.mp4',
    cybersecurity: '/videos/Cyber Security.mp4',
    antivirus: '/videos/Antivirus.mp4',
    malware: '/videos/Malware.mp4',
    phishing: '/videos/phishing.mp4',
    ransomware: '/videos/ransomware.mp4'
  };

  const transcripts = {
    greeting: "👋 Hi there, welcome! I’m your cybersecurity assistant. Let’s get started.",
    zip: "Please tell me your zip code.",
    phone: "Thanks! Now please provide your phone number.",
    start: "Perfect! You’re all set. Ask me anything about cybersecurity.",
    cybersecurity: "Here’s some information about cybersecurity threats and solutions.",
    antivirus: "Here’s some guidance about antivirus software.",
    malware: "Malware is malicious software that can damage or steal data.",
    phishing: "Phishing is a scam to steal sensitive information.",
    ransomware: "Ransomware locks files until a ransom is paid."
  };

  function addMessage(role, text){
    const wrap = document.createElement('div');
    wrap.className = 'chat-message-wrapper ' + (role==='user'?'user':'bot');
    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble ' + (role==='user'?'user-msg':'bot-msg');
    bubble.innerText = text;
    const ts = document.createElement('div');
    ts.className = 'message-timestamp';
    ts.innerText = new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
    wrap.appendChild(bubble);
    wrap.appendChild(ts);
    chatMessages.appendChild(wrap);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function playVideo(key, loop=false, callback=null){
    if(!videos[key]) return;
    aiSpeaking = true;
    talkVideo.src = videos[key];
    talkVideo.loop = loop;
    talkVideo.muted = !soundEnabled;
    talkVideo.style.display = 'block';
    idleVideo.style.display = 'none';
    talkVideo.currentTime = 0;
    talkVideo.play().catch(e=>console.warn('play failed', e));

    if(transcripts[key]) addMessage('bot', transcripts[key]);

    talkVideo.onended = () => {
      aiSpeaking = false;
      talkVideo.style.display = 'none';
      idleVideo.style.display = 'block';
      idleVideo.muted = !soundEnabled;
      idleVideo.play().catch(()=>{});
      if(callback) callback();
    };
  }

  let step3Shown = false;

  async function handleUserInput(text){
    if(!text) return;
    addMessage('user', text);

    // Step 1: Zip code
    if(onboardingStep === 1){
      onboardingStep = 2;
      const zipResponse = "Thanks! Now please provide your phone number.";
      playVideo('zip', false, ()=> addMessage('bot', zipResponse));
      return;
    }

    // Step 2: Phone number
    if(onboardingStep === 2){
      onboardingStep = 3;
      const phoneResponse = "Perfect! You’re all set. Ask me anything about cybersecurity.";
      playVideo('phone', false, ()=> addMessage('bot', phoneResponse));
      return;
    }

    // Step 3: Start / general questions
    if(onboardingStep === 3 && !step3Shown){
      step3Shown = true;
      onboardingStep = 4;
      playVideo('start', false, ()=>{});
      return;
    }

    // Step 4+: General cybersecurity topics
    if(onboardingStep >= 4){
      if(/cyber|threat/i.test(text)) playVideo('cybersecurity', false);
      else if(/antivirus/i.test(text)) playVideo('antivirus', false);
      else if(/malware/i.test(text)) playVideo('malware', false);
      else if(/phishing/i.test(text)) playVideo('phishing', false);
      else if(/ransomware/i.test(text)) playVideo('ransomware', false);
      else if(/hack/i.test(text)) playVideo('hacked', false);
      else if(/firewall/i.test(text)) playVideo('firewall', false);
      else if(/social/i.test(text)) playVideo('social cyber security', false);
      else addMessage('bot', "I don’t have a video for that yet, but I’m learning!");
    }
  }

  async function sendMessage(){
    const text = userInput.value.trim();
    if(!text) return;
    userInput.value='';
    typingIndicator.style.display='block';
    await handleUserInput(text);
    typingIndicator.style.display='none';
  }

  enterButton.addEventListener('click', sendMessage);
  userInput.addEventListener('keypress', e=>{ if(e.key==='Enter') sendMessage(); });

  // 🎬 Kickoff: Greeting → idle → start onboarding
  playVideo('greeting', false, ()=>{ 
    onboardingStep = 1;
    playVideo('idle', true);
  });

  // Mute/unmute
  muteBtn.addEventListener('click', ()=>{
    soundEnabled = !soundEnabled;
    talkVideo.muted = !soundEnabled;
    idleVideo.muted = !soundEnabled;
    muteBtn.textContent = !soundEnabled ? '🔇 Unmute' : '🔊 Mute';
  });
});

