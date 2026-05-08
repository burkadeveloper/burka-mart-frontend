import { useState, useRef } from "react";
import { Mic, Square, Loader2 } from "lucide-react";
import api from "../api/axiosClient";

export default function AudioRecorder({ onRecorded }) {
  const [recording, setRecording] = useState(false);
  const [uploading, setUploading] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = (e) =>
        chunksRef.current.push(e.data);
      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const file = new File([blob], `recording-${Date.now()}.webm`, {
          type: "audio/webm",
        });
        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);
        try {
          const res = await api.post("/chats/upload", formData);
          onRecorded(res.data.file);
        } catch (err) {
          console.error(err);
          alert("Upload failed");
        } finally {
          setUploading(false);
        }
        stream.getTracks().forEach((track) => track.stop());
      };
      mediaRecorderRef.current.start();
      setRecording(true);
    } catch (err) {
      alert("Microphone access denied");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  return (
    <div className="relative">
      {uploading ? (
        <Loader2 size={20} className="animate-spin text-blue-500" />
      ) : (
        <button
          onClick={recording ? stopRecording : startRecording}
          className={`p-1 rounded-full ${recording ? "text-red-500 animate-pulse" : "text-gray-500 hover:text-gray-700"}`}
        >
          <Mic size={20} />
        </button>
      )}
    </div>
  );
}
