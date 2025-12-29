"use client";

import { useState, useEffect } from "react";
import CryptoJS from "crypto-js";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

// Main component wrapped in Suspense for useSearchParams
function DeviceInfoContent() {
  const searchParams = useSearchParams();
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [responseData, setResponseData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState("Reading NFC tag...");

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

    const params = { deviceMac: mac.trim().toUpperCase() };
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
      setStatusMessage("");
    } catch (e: any) {
      setResponseData({ error: e.toString() });
      setStatusMessage("Error fetching device info");
    }

    setLoading(false);
  };

  // Check URL for device ID on page load (works when NFC tag opens this URL)
  useEffect(() => {
    // Check multiple possible URL parameter names
    const idFromUrl = 
      searchParams.get("id") || 
      searchParams.get("deviceId") || 
      searchParams.get("deviceMac") ||
      searchParams.get("mac");
    
    if (idFromUrl) {
      setDeviceId(idFromUrl.toUpperCase());
      callApi(idFromUrl);
    } else {
      setLoading(false);
      setStatusMessage("");
    }
  }, [searchParams]);

  // No device ID in URL - show instruction to scan NFC
  if (!deviceId && !loading) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex flex-col items-center justify-center p-6">
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
          <div className="w-full bg-[#252525] rounded-2xl border border-[#333] p-8 text-center">
            {/* NFC Icon */}
            <div className="w-20 h-20 mx-auto mb-6 bg-[#F5C518]/10 rounded-full flex items-center justify-center">
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

            <h1 className="text-2xl font-bold text-[#F5C518] mb-3">
              Scan NFC Tag
            </h1>
            <p className="text-gray-400 text-sm">
              Place your phone near the NFC tag to get device information
            </p>
          </div>

          {/* Footer */}
          <p className="mt-8 text-gray-600 text-xs">
            © 2024 Waxx Brandz. All rights reserved.
          </p>
        </div>
      </div>
    );
  }

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
          <h1 className="text-2xl font-bold text-[#F5C518] text-center mb-6">
            Device Info
          </h1>

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center py-8">
              <div className="w-10 h-10 border-3 border-[#F5C518]/30 border-t-[#F5C518] rounded-full animate-spin mb-4" />
              <p className="text-gray-400 text-sm">{statusMessage}</p>
            </div>
          )}

          {/* Error Message */}
          {statusMessage && !loading && (
            <div className="text-center mb-4">
              <p className="text-red-400 text-sm">{statusMessage}</p>
            </div>
          )}

          {/* Device ID Display */}
          {deviceId && !loading && (
            <div className="mb-4 p-4 bg-[#1a1a1a] rounded-xl border border-[#333]">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                Device ID
              </p>
              <p className="text-lg font-mono text-[#F5C518] break-all">
                {deviceId}
              </p>
            </div>
          )}

          {/* Device Info Display */}
          {responseData && !loading && (
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                Device Info
              </p>
              <pre className="p-4 bg-[#1a1a1a] rounded-xl border border-[#333] text-sm text-gray-300 overflow-auto max-h-80 font-mono">
                {JSON.stringify(responseData, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="mt-8 text-gray-600 text-xs">
          © 2024 Waxx Brandz. All rights reserved.
        </p>
      </div>
    </div>
  );
}

// Loading fallback
function LoadingFallback() {
  return (
    <div className="min-h-screen bg-[#1a1a1a] flex flex-col items-center justify-center p-6">
      <div className="w-8 h-8 border-2 border-[#F5C518]/30 border-t-[#F5C518] rounded-full animate-spin" />
    </div>
  );
}

// Export with Suspense wrapper
export default function Page() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <DeviceInfoContent />
    </Suspense>
  );
}
