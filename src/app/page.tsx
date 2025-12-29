"use client";

import { useState, useEffect, Suspense } from "react";
import CryptoJS from "crypto-js";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

function DeviceInfoContent() {
  const searchParams = useSearchParams();
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [responseData, setResponseData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Edit modals
  const [showEditBrand, setShowEditBrand] = useState(false);
  const [showEditFlavor, setShowEditFlavor] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Edit form data
  const [brandForm, setBrandForm] = useState({
    brandId: 0,
    brandName: "",
    brandLogo: "",
    brandCoverImage: "",
    brandIntroduction: "",
    brandUrl: "",
    brandIns: "",
  });

  const [flavorForm, setFlavorForm] = useState({
    flavorId: 0,
    flavorName: "",
    flavorLogo: "",
    flavorCartUrl: "",
    flavorCarouselMap: "",
    flavorDetailsMap: "",
    retailPrice: 0,
    suggestRetailPrice: 0,
  });

  // Generate nonce
  function generateNonce(length: number) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
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

  const secretKey = "c2add694bf942dc77b376592d9c862c";

  const callApi = async (mac: string) => {
    setLoading(true);
    setError(null);

    const timestamp = Date.now().toString();
    const nonce = generateNonce(16);

    const params = { deviceMac: mac.trim().toUpperCase() };
    const sortedParams = sortObject(params);
    const queryString = objectToQueryString(sortedParams);

    const messageToSign = `${timestamp}\n${nonce}\n${queryString}`;
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
      
      // Initialize edit forms with current data
      if (json.data) {
        setBrandForm({
          brandId: json.data.brandId || 0,
          brandName: json.data.brandName || "",
          brandLogo: json.data.brandLogo || "",
          brandCoverImage: json.data.brandCoverImage || "",
          brandIntroduction: json.data.brandIntroduction || "",
          brandUrl: json.data.brandUrl || "",
          brandIns: json.data.brandIns || "",
        });
        // Convert carousel array to comma-separated string
        const carouselUrls = json.data.flavorCarouselMap
          ?.map((item: any) => item.url)
          .filter(Boolean)
          .join(",") || "";
        // Convert details array to comma-separated string
        const detailsUrls = json.data.flavorDetailsMap?.join(",") || "";
        
        setFlavorForm({
          flavorId: json.data.flavorId || 0,
          flavorName: json.data.flavorName || "",
          flavorLogo: json.data.flavorLogo || "",
          flavorCartUrl: json.data.flavorCartUrl || "",
          flavorCarouselMap: carouselUrls,
          flavorDetailsMap: detailsUrls,
          retailPrice: json.data.retailPrice || 0,
          suggestRetailPrice: json.data.suggestRetailPrice || 0,
        });
      }
    } catch (e: any) {
      setError("Failed to fetch device info. Please try again.");
      setResponseData(null);
    }

    setLoading(false);
  };

  // Update Brand API
  const updateBrand = async () => {
    setSaving(true);
    setSaveMessage(null);

    const timestamp = Date.now().toString();
    const nonce = generateNonce(16);

    const sortedParams = sortObject(brandForm);
    const queryString = objectToQueryString(sortedParams);
    const messageToSign = `${timestamp}\n${nonce}\n${queryString}`;
    const signature = generateSignature(secretKey, messageToSign);

    try {
      const res = await fetch("https://app.unicoreus.com/supplement/front/waxx/updateBrandData", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Timestamp": timestamp,
          "X-Nonce": nonce,
          "X-App-Key": secretKey,
          "X-Signature": signature,
        },
        body: JSON.stringify(brandForm),
      });

      const json = await res.json();
      if (json.success) {
        setSaveMessage({ type: "success", text: "Brand updated successfully!" });
        // Refresh device info
        if (deviceId) callApi(deviceId);
        setTimeout(() => setShowEditBrand(false), 1500);
      } else {
        setSaveMessage({ type: "error", text: json.message || "Failed to update brand" });
      }
    } catch (e: any) {
      setSaveMessage({ type: "error", text: "Failed to update brand" });
    }

    setSaving(false);
  };

  // Update Flavor API
  const updateFlavor = async () => {
    setSaving(true);
    setSaveMessage(null);

    const timestamp = Date.now().toString();
    const nonce = generateNonce(16);

    const sortedParams = sortObject(flavorForm);
    const queryString = objectToQueryString(sortedParams);
    const messageToSign = `${timestamp}\n${nonce}\n${queryString}`;
    const signature = generateSignature(secretKey, messageToSign);

    try {
      const res = await fetch("https://app.unicoreus.com/supplement/front/waxx/updateFlavorData", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Timestamp": timestamp,
          "X-Nonce": nonce,
          "X-App-Key": secretKey,
          "X-Signature": signature,
        },
        body: JSON.stringify(flavorForm),
      });

      const json = await res.json();
      if (json.success) {
        setSaveMessage({ type: "success", text: "Flavor updated successfully!" });
        // Refresh device info
        if (deviceId) callApi(deviceId);
        setTimeout(() => setShowEditFlavor(false), 1500);
      } else {
        setSaveMessage({ type: "error", text: json.message || "Failed to update flavor" });
      }
    } catch (e: any) {
      setSaveMessage({ type: "error", text: "Failed to update flavor" });
    }

    setSaving(false);
  };

  // Read device ID from URL and fetch info automatically
  useEffect(() => {
    const idFromUrl =
      searchParams.get("id") ||
      searchParams.get("deviceId") ||
      searchParams.get("deviceMac") ||
      searchParams.get("mac");

    if (idFromUrl) {
      const id = idFromUrl.toUpperCase();
      setDeviceId(id);
      callApi(id);
    } else {
      setDeviceId(null);
      setLoading(false);
    }
  }, [searchParams]);

  // Get device data
  const deviceData = responseData?.data;
  const isSuccess = responseData?.success === true;
  const isVerified = isSuccess && deviceData;

  // Carousel images
  const carouselImages = deviceData?.flavorCarouselMap?.filter((item: any) => item.url) || [];

  // Auto-slide carousel
  useEffect(() => {
    if (carouselImages.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [carouselImages.length]);

  // No device ID - show scan instruction
  if (!deviceId) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex flex-col items-center justify-center p-6">
        <div className="flex flex-col items-center max-w-md w-full">
          <div className="mb-12">
            <Image src="/logo.png" alt="Waxx Brandz" width={200} height={70} priority />
          </div>
          <div className="w-full bg-[#252525] rounded-2xl border border-[#333] p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-[#F5C518]/10 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-[#F5C518]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.14 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-[#F5C518] mb-3">Scan NFC Tag</h1>
            <p className="text-gray-400 text-sm">Place your phone near the NFC tag to verify your product</p>
          </div>
          <p className="mt-8 text-gray-600 text-xs">© 2024 Waxx Brandz. All rights reserved.</p>
        </div>
      </div>
    );
  }

  // Show device info
  return (
    <div className="min-h-screen bg-[#1a1a1a] flex flex-col items-center p-4 pb-24">
      <div className="flex flex-col items-center max-w-md w-full">
        {/* Logo */}
        <div className="my-6">
          <Image src="/logo.png" alt="Waxx Brandz" width={160} height={56} priority />
        </div>

        {/* Card */}
        <div className="w-full bg-[#252525] rounded-2xl border border-[#333] overflow-hidden">
          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center py-16">
              <div className="w-12 h-12 border-4 border-[#F5C518]/30 border-t-[#F5C518] rounded-full animate-spin mb-4" />
              <p className="text-gray-400 text-sm">Verifying product...</p>
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="text-center py-12 px-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-500/10 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-red-500 mb-2">Verification Failed</h2>
              <p className="text-gray-400 text-sm">{error}</p>
            </div>
          )}

          {/* Verified Product */}
          {isVerified && !loading && (
            <>
              {/* Carousel */}
              {carouselImages.length > 0 && (
                <div className="relative w-full aspect-square bg-[#1a1a1a]">
                  {carouselImages.map((item: any, index: number) => (
                    <img
                      key={index}
                      src={item.url}
                      alt={`Product ${index + 1}`}
                      className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${index === currentSlide ? "opacity-100" : "opacity-0"}`}
                    />
                  ))}
                  {carouselImages.length > 1 && (
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                      {carouselImages.map((_: any, index: number) => (
                        <button
                          key={index}
                          onClick={() => setCurrentSlide(index)}
                          className={`w-2 h-2 rounded-full transition-all ${index === currentSlide ? "bg-[#F5C518] w-6" : "bg-white/50"}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Product Info */}
              <div className="p-6">
                {/* Verified Badge */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-green-500 font-semibold">Verified Authentic</span>
                </div>

                {/* Brand Info */}
                {deviceData.brandName && (
                  <div className="flex items-center gap-3 mb-4">
                    {deviceData.brandLogo && (
                      <img src={deviceData.brandLogo} alt={deviceData.brandName} className="w-10 h-10 rounded-lg object-cover" />
                    )}
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Brand</p>
                      <p className="text-white font-semibold">{deviceData.brandName}</p>
                    </div>
                  </div>
                )}

                {/* Flavor Name */}
                <h1 className="text-2xl font-bold text-white mb-2">{deviceData.flavorName || "Unknown Product"}</h1>

                {/* Labels */}
                {deviceData.flavorLabelList && deviceData.flavorLabelList.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {deviceData.flavorLabelList.map((label: any, index: number) => (
                      <span
                        key={index}
                        className="px-3 py-1 text-sm font-medium rounded-full"
                        style={{ backgroundColor: `${label.labelColor}20`, color: label.labelColor || "#F5C518" }}
                      >
                        {label.labelName}
                      </span>
                    ))}
                  </div>
                )}

                <div className="border-t border-[#333] my-4" />

                {/* Device Details Grid */}
                <div className="grid grid-cols-2 gap-3">
                  {deviceData.deviceName && (
                    <div className="p-3 bg-[#1a1a1a] rounded-xl">
                      <p className="text-xs text-gray-500 mb-1">Device</p>
                      <p className="text-white font-medium">{deviceData.deviceName}</p>
                    </div>
                  )}
                  {deviceData.deviceActivatedTime && (
                    <div className="p-3 bg-[#1a1a1a] rounded-xl">
                      <p className="text-xs text-gray-500 mb-1">Activated</p>
                      <p className="text-white font-medium">{deviceData.deviceActivatedTime}</p>
                    </div>
                  )}
                  <div className="p-3 bg-[#1a1a1a] rounded-xl">
                    <p className="text-xs text-gray-500 mb-1">Status</p>
                    <p className={`font-medium ${deviceData.activated ? "text-green-500" : "text-yellow-500"}`}>
                      {deviceData.activated ? "Activated" : "Not Activated"}
                    </p>
                  </div>
                  <div className="p-3 bg-[#1a1a1a] rounded-xl">
                    <p className="text-xs text-gray-500 mb-1">Binding</p>
                    <p className={`font-medium ${deviceData.bindDeviceStatus ? "text-green-500" : "text-gray-400"}`}>
                      {deviceData.bindDeviceStatus ? "Bound" : "Unbound"}
                    </p>
                  </div>
                </div>

                {/* Prices */}
                {(deviceData.retailPrice > 0 || deviceData.suggestRetailPrice > 0) && (
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    {deviceData.retailPrice > 0 && (
                      <div className="p-3 bg-[#1a1a1a] rounded-xl">
                        <p className="text-xs text-gray-500 mb-1">Retail Price</p>
                        <p className="text-[#F5C518] font-bold">${deviceData.retailPrice}</p>
                      </div>
                    )}
                    {deviceData.suggestRetailPrice > 0 && (
                      <div className="p-3 bg-[#1a1a1a] rounded-xl">
                        <p className="text-xs text-gray-500 mb-1">MSRP</p>
                        <p className="text-white font-medium">${deviceData.suggestRetailPrice}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Device ID */}
                <div className="mt-4 p-3 bg-[#1a1a1a] rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">Device ID</p>
                  <p className="text-sm font-mono text-[#F5C518] break-all">{deviceData.deviceMac || deviceId}</p>
                </div>

                {/* Cartridge Info */}
                {deviceData.cartridgeMac && deviceData.cartridgeMac !== "-" && (
                  <div className="mt-3 p-3 bg-[#1a1a1a] rounded-xl">
                    <p className="text-xs text-gray-500 mb-1">Cartridge ID</p>
                    <p className="text-sm font-mono text-gray-300 break-all">{deviceData.cartridgeMac}</p>
                  </div>
                )}

                {/* Product Details Images */}
                {deviceData.flavorDetailsMap && deviceData.flavorDetailsMap.length > 0 && (
                  <div className="mt-6">
                    <p className="text-xs text-gray-500 uppercase mb-3">Product Details</p>
                    <div className="space-y-2">
                      {deviceData.flavorDetailsMap.map((url: string, index: number) => (
                        <img key={index} src={url} alt={`Detail ${index + 1}`} className="w-full rounded-xl" />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Not Verified */}
          {!isVerified && !loading && !error && responseData && (
            <div className="text-center py-12 px-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-500/10 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-red-500 mb-2">Not Verified</h2>
              <p className="text-gray-400 text-sm">{responseData.message || "This product could not be verified"}</p>
            </div>
          )}
        </div>

        <p className="mt-6 text-gray-600 text-xs">© 2024 Waxx Brandz. All rights reserved.</p>
      </div>

      {/* Fixed Bottom Edit Buttons */}
      {isVerified && !loading && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#1a1a1a] border-t border-[#333] p-4">
          <div className="max-w-md mx-auto flex gap-3">
            <button
              onClick={() => { setSaveMessage(null); setShowEditBrand(true); }}
              className="flex-1 py-3 px-4 bg-[#333] hover:bg-[#444] text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Brand
            </button>
            <button
              onClick={() => { setSaveMessage(null); setShowEditFlavor(true); }}
              className="flex-1 py-3 px-4 bg-[#F5C518] hover:bg-[#d4aa00] text-[#1a1a1a] font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Flavor
            </button>
          </div>
        </div>
      )}

      {/* Edit Brand Modal */}
      {showEditBrand && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-end justify-center">
          <div className="w-full max-w-md bg-[#252525] rounded-t-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-[#252525] p-4 border-b border-[#333] flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Edit Brand</h2>
              <button onClick={() => setShowEditBrand(false)} className="p-2 hover:bg-[#333] rounded-lg">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-xs text-gray-500 uppercase mb-2">Brand Name</label>
                <input
                  type="text"
                  value={brandForm.brandName}
                  onChange={(e) => setBrandForm({ ...brandForm, brandName: e.target.value })}
                  className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#333] rounded-xl text-white focus:outline-none focus:border-[#F5C518]"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 uppercase mb-2">Brand Logo URL</label>
                <input
                  type="text"
                  value={brandForm.brandLogo}
                  onChange={(e) => setBrandForm({ ...brandForm, brandLogo: e.target.value })}
                  className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#333] rounded-xl text-white focus:outline-none focus:border-[#F5C518]"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 uppercase mb-2">Cover Image URL</label>
                <input
                  type="text"
                  value={brandForm.brandCoverImage}
                  onChange={(e) => setBrandForm({ ...brandForm, brandCoverImage: e.target.value })}
                  className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#333] rounded-xl text-white focus:outline-none focus:border-[#F5C518]"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 uppercase mb-2">Introduction</label>
                <textarea
                  value={brandForm.brandIntroduction}
                  onChange={(e) => setBrandForm({ ...brandForm, brandIntroduction: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#333] rounded-xl text-white focus:outline-none focus:border-[#F5C518] resize-none"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 uppercase mb-2">Website URL</label>
                <input
                  type="text"
                  value={brandForm.brandUrl}
                  onChange={(e) => setBrandForm({ ...brandForm, brandUrl: e.target.value })}
                  className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#333] rounded-xl text-white focus:outline-none focus:border-[#F5C518]"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 uppercase mb-2">Instagram URL</label>
                <input
                  type="text"
                  value={brandForm.brandIns}
                  onChange={(e) => setBrandForm({ ...brandForm, brandIns: e.target.value })}
                  className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#333] rounded-xl text-white focus:outline-none focus:border-[#F5C518]"
                />
              </div>

              {saveMessage && (
                <div className={`p-3 rounded-xl text-center ${saveMessage.type === "success" ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"}`}>
                  {saveMessage.text}
                </div>
              )}

              <button
                onClick={updateBrand}
                disabled={saving}
                className="w-full py-4 bg-[#F5C518] hover:bg-[#d4aa00] text-[#1a1a1a] font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <span className="w-5 h-5 border-2 border-[#1a1a1a]/30 border-t-[#1a1a1a] rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Flavor Modal */}
      {showEditFlavor && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-end justify-center">
          <div className="w-full max-w-md bg-[#252525] rounded-t-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-[#252525] p-4 border-b border-[#333] flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Edit Flavor</h2>
              <button onClick={() => setShowEditFlavor(false)} className="p-2 hover:bg-[#333] rounded-lg">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-xs text-gray-500 uppercase mb-2">Flavor Name</label>
                <input
                  type="text"
                  value={flavorForm.flavorName}
                  onChange={(e) => setFlavorForm({ ...flavorForm, flavorName: e.target.value })}
                  className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#333] rounded-xl text-white focus:outline-none focus:border-[#F5C518]"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 uppercase mb-2">Flavor Logo URL</label>
                <input
                  type="text"
                  value={flavorForm.flavorLogo}
                  onChange={(e) => setFlavorForm({ ...flavorForm, flavorLogo: e.target.value })}
                  className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#333] rounded-xl text-white focus:outline-none focus:border-[#F5C518]"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 uppercase mb-2">Cart URL</label>
                <input
                  type="text"
                  value={flavorForm.flavorCartUrl}
                  onChange={(e) => setFlavorForm({ ...flavorForm, flavorCartUrl: e.target.value })}
                  className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#333] rounded-xl text-white focus:outline-none focus:border-[#F5C518]"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 uppercase mb-2">Carousel Images (comma-separated URLs)</label>
                <textarea
                  value={flavorForm.flavorCarouselMap}
                  onChange={(e) => setFlavorForm({ ...flavorForm, flavorCarouselMap: e.target.value })}
                  rows={3}
                  placeholder="https://example.com/img1.jpg,https://example.com/img2.jpg"
                  className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#333] rounded-xl text-white focus:outline-none focus:border-[#F5C518] resize-none text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 uppercase mb-2">Detail Images (comma-separated URLs)</label>
                <textarea
                  value={flavorForm.flavorDetailsMap}
                  onChange={(e) => setFlavorForm({ ...flavorForm, flavorDetailsMap: e.target.value })}
                  rows={3}
                  placeholder="https://example.com/detail1.jpg,https://example.com/detail2.jpg"
                  className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#333] rounded-xl text-white focus:outline-none focus:border-[#F5C518] resize-none text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 uppercase mb-2">Retail Price</label>
                  <input
                    type="number"
                    value={flavorForm.retailPrice}
                    onChange={(e) => setFlavorForm({ ...flavorForm, retailPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#333] rounded-xl text-white focus:outline-none focus:border-[#F5C518]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 uppercase mb-2">MSRP</label>
                  <input
                    type="number"
                    value={flavorForm.suggestRetailPrice}
                    onChange={(e) => setFlavorForm({ ...flavorForm, suggestRetailPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#333] rounded-xl text-white focus:outline-none focus:border-[#F5C518]"
                  />
                </div>
              </div>

              {saveMessage && (
                <div className={`p-3 rounded-xl text-center ${saveMessage.type === "success" ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"}`}>
                  {saveMessage.text}
                </div>
              )}

              <button
                onClick={updateFlavor}
                disabled={saving}
                className="w-full py-4 bg-[#F5C518] hover:bg-[#d4aa00] text-[#1a1a1a] font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <span className="w-5 h-5 border-2 border-[#1a1a1a]/30 border-t-[#1a1a1a] rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Loading fallback
function LoadingFallback() {
  return (
    <div className="min-h-screen bg-[#1a1a1a] flex flex-col items-center justify-center p-6">
      <div className="w-12 h-12 border-4 border-[#F5C518]/30 border-t-[#F5C518] rounded-full animate-spin" />
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <DeviceInfoContent />
    </Suspense>
  );
}
