import { useRef } from "react";
import { Paperclip } from "lucide-react";
import api from "../api/axiosClient";

export default function FileAttachment({ onAttach }) {
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await api.post("/chats/upload", formData);
      onAttach(res.data.file);
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    }
    fileInputRef.current.value = "";
  };

  return (
    <>
      <button
        onClick={() => fileInputRef.current.click()}
        className="p-1 text-gray-500 hover:text-gray-700"
      >
        <Paperclip size={20} />
      </button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*,audio/*,application/pdf,text/plain"
      />
    </>
  );
}
