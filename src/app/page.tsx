"use client";

import { useState, useEffect } from "react";
import CryptoJS from "crypto-js";
import Image from "next/image";

// Extend Window interface for Web NFC API
declare global {
  interface Window {
    NDEFReader: any;
  }
}

export default function Page() {
  const [deviceMac, setDeviceMac] = useState<string | null>(null);
  const [responseData, setResponseData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [nfcSupported, setNfcSupported] = useState(true);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    // Check if NFC is supported
    if (!("NDEFReader" in window)) {
      setNfcSupported(false);
    }
  }, []);

  // Generate nonce
  function generateNonce(length: number) {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Sort object by key
  function sortObject(obj: any) {
    return Object.keys(obj)
      .sort()
      .reduce((result: any, key) => {
        result[key] = obj[key];
        return result;
      }, {});
  }

  // Convert object to query string
  function objectToQueryString(obj: any) {
    return Object.keys(obj)
      .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`)
      .join("&");
  }

  // HMAC-SHA256 signature
  function generateSignature(secretKey: string, message: string) {
    const hmac = CryptoJS.HmacSHA256(message, secretKey);
    return hmac.toString(CryptoJS.enc.Hex);
  }

  const callApi = async (mac: string) => {
    setLoading(true);
    setStatusMessage("Fetching device info...");

    const timestamp = Date.now().toString();
    const nonce = generateNonce(16);

    const params = { deviceMac: mac };
    const sortedParams = sortObject(params);
    const queryString = objectToQueryString(sortedParams);

    const messageToSign = `${timestamp}\n${nonce}\n${queryString}`;
    const secretKey = "c2add694bf942dc77b376592d9c862c";
    const signature = generateSignature(secretKey, messageToSign);

    const url = `https://app.unicoreus.com/supplement/front/waxx/getDeviceInfo?${queryString}`;

    try {
      const res = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-Timestamp": timestamp,
          "X-Nonce": nonce,
          "X-App-Key": secretKey,
          "X-Signature": signature,
        },
      });

      const json = await res.json();
      setResponseData(json);
      setStatusMessage("Device info loaded successfully!");
    } catch (e: any) {
      setResponseData({ error: e.toString() });
      setStatusMessage("Error fetching device info");
    }

    setLoading(false);
  };

  // Helper function to decode NDEF text record
  const decodeTextRecord = (record: any): string => {
    const textDecoder = new TextDecoder();
    const dataView = new DataView(record.data.buffer);
    
    // First byte contains status byte (language code length)
    const statusByte = dataView.getUint8(0);
    const languageCodeLength = statusByte & 0x3f; // Lower 6 bits
    
    // Skip status byte and language code to get the actual text
    const textBytes = new Uint8Array(
      record.data.buffer,
      record.data.byteOffset + 1 + languageCodeLength,
      record.data.byteLength - 1 - languageCodeLength
    );
    
    return textDecoder.decode(textBytes);
  };

  // Helper function to read text from any NDEF record type
  const readNdefData = (message: any): string | null => {
    for (const record of message.records) {
      try {
        if (record.recordType === "text") {
          // Standard text record
          return decodeTextRecord(record);
        } else if (record.recordType === "url") {
          // URL record - extract device ID from URL if present
          const textDecoder = new TextDecoder();
          const url = textDecoder.decode(record.data);
          // If URL contains the device ID, extract it
          const match = url.match(/[A-F0-9]{16}/i);
          if (match) return match[0].toUpperCase();
          return url;
        } else if (record.recordType === "unknown" || record.recordType === "mime") {
          // Try to decode as plain text
          const textDecoder = new TextDecoder();
          const text = textDecoder.decode(record.data);
          // Check if it looks like a device ID (hex string)
          if (/^[A-F0-9]+$/i.test(text.trim())) {
            return text.trim().toUpperCase();
          }
          return text.trim();
        }
      } catch (e) {
        console.error("Error decoding record:", e);
      }
    }
    return null;
  };

  const scanNFC = async () => {
    if (!nfcSupported) {
      setStatusMessage("NFC is not supported on this device/browser");
      return;
    }

    try {
      setScanning(true);
      setStatusMessage("Ready to scan. Place NFC tag near your device...");
      setResponseData(null);
      setDeviceMac(null);

      const ndef = new window.NDEFReader();
      await ndef.scan();

      ndef.addEventListener("reading", ({ message, serialNumber }: { message: any; serialNumber: string }) => {
        setScanning(false);
        
        // Try to read written data from the tag first
        let deviceId = readNdefData(message);
        
        if (deviceId) {
          // Successfully read written data
          setDeviceMac(deviceId);
          setStatusMessage("NFC tag scanned! Fetching device info...");
          callApi(deviceId);
        } else if (serialNumber) {
          // Fallback to serial number if no written data found
          const mac = serialNumber.replace(/[:-]/g, "").toUpperCase();
          setDeviceMac(mac);
          setStatusMessage("NFC tag scanned! Fetching device info...");
          callApi(mac);
        } else {
          setStatusMessage("No device ID found on NFC tag.");
        }
      });

      ndef.addEventListener("readingerror", () => {
        setScanning(false);
        setStatusMessage("Error reading NFC tag. Please try again.");
      });
    } catch (error: any) {
      setScanning(false);
      if (error.name === "NotAllowedError") {
        setStatusMessage("NFC permission denied. Please allow NFC access.");
      } else if (error.name === "NotSupportedError") {
        setStatusMessage("NFC is not supported on this device.");
        setNfcSupported(false);
      } else {
        setStatusMessage(`Error: ${error.message}`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex flex-col items-center justify-center p-6">
      {/* Main content */}
      <div className="flex flex-col items-center max-w-md w-full">
        {/* Logo */}
        <div className="mb-12">
          <Image
            src="/logo.png"
            alt="Waxx Brandz"
            width={200}
            height={70}
            priority
          />
        </div>

        {/* Card */}
        <div className="w-full bg-[#252525] rounded-2xl border border-[#333] p-8">
          <h1 className="text-2xl font-bold text-[#F5C518] text-center mb-2">
            Get Device Info
          </h1>
          <p className="text-gray-400 text-center text-sm mb-8">
            Scan your NFC tag to get device information
          </p>

          {/* Scan Button */}
          <button
            onClick={scanNFC}
            disabled={scanning || loading}
            className={`w-full py-2 px-3 rounded-xl font-bold text-lg transition-all duration-200 flex items-center justify-center gap-3 ${
              scanning || loading
                ? "bg-[#9a8a10] cursor-not-allowed"
                : "bg-[#F5C518] hover:bg-[#d4aa00] active:scale-[0.98]"
            } text-[#1a1a1a]`}
          >
            {scanning ? (
              <>
                <span className="w-5 h-5 border-2 border-[#1a1a1a]/30 border-t-[#1a1a1a] rounded-full animate-spin" />
                Scanning...
              </>
            ) : loading ? (
              <>
                <span className="w-5 h-5 border-2 border-[#1a1a1a]/30 border-t-[#1a1a1a] rounded-full animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
                SCAN NFC
              </>
            )}
          </button>

          {/* Status Message */}
          {statusMessage && (
            <div className="mt-6 text-center">
              <p
                className={`text-sm ${
                  statusMessage.includes("Error") || statusMessage.includes("denied")
                    ? "text-red-400"
                    : statusMessage.includes("success")
                    ? "text-green-400"
                    : "text-gray-300"
                }`}
              >
                {statusMessage}
              </p>
            </div>
          )}

          {/* NFC Animation when scanning */}
          {scanning && (
            <div className="mt-8 flex justify-center">
              <div className="relative w-24 h-24">
                <div className="absolute inset-0 rounded-full border-2 border-[#F5C518]/50 animate-ping" />
                <div className="absolute inset-2 rounded-full border-2 border-[#F5C518]/50 animate-ping animation-delay-200" />
                <div className="absolute inset-4 rounded-full border-2 border-[#F5C518]/50 animate-ping animation-delay-400" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg
                    className="w-10 h-10 text-[#F5C518]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.14 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
                    />
                  </svg>
                </div>
              </div>
            </div>
          )}

          {/* Device ID Display */}
          {deviceMac && (
            <div className="mt-6 p-4 bg-[#1a1a1a] rounded-xl border border-[#333]">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                Device ID
              </p>
              <p className="text-lg font-mono text-[#F5C518] break-all">
                {deviceMac}
              </p>
            </div>
          )}

          {/* Response Display */}
          {responseData && (
            <div className="mt-6">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                Device Info
              </p>
              <pre className="p-4 bg-[#1a1a1a] rounded-xl border border-[#333] text-sm text-gray-300 overflow-auto max-h-64 font-mono">
                {JSON.stringify(responseData, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* NFC Not Supported Warning */}
        {!nfcSupported && (
          <div className="mt-6 p-4 bg-[#3d3000] border border-[#F5C518]/30 rounded-xl text-center">
            <p className="text-[#F5C518] text-sm">
              ⚠️ Web NFC requires Chrome on Android or a laptop with NFC support
            </p>
          </div>
        )}

        {/* Footer */}
        <p className="mt-8 text-gray-600 text-xs">
          © 2024 Waxx Brandz. All rights reserved.
        </p>
      </div>
    </div>
  );
}
