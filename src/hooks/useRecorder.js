import { useState, useRef } from 'react';

const useRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState('');
  const [audioBlob, setAudioBlob] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = async () => {
    setIsRecording(true);
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new window.MediaRecorder(stream);
    audioChunksRef.current = [];
    mediaRecorderRef.current.ondataavailable = (event) => {
      audioChunksRef.current.push(event.data);
    };
    mediaRecorderRef.current.onstop = () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
      setAudioBlob(audioBlob);
      setAudioURL(URL.createObjectURL(audioBlob));
    };
    mediaRecorderRef.current.start();
  };

  const stopRecording = () => {
    setIsRecording(false);
    mediaRecorderRef.current.stop();
  };

  return { isRecording, audioURL, audioBlob, startRecording, stopRecording };
};

export default useRecorder; 