"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";

export default function SingleFlavorPage() {
  const [selectedPuff, setSelectedPuff] = useState("singlePuff");
  const [isLocked, setIsLocked] = useState(false);
  const [batteryLevel] = useState(75);
  const [sliderValue, setSliderValue] = useState(30);
  const [showModal, setShowModal] = useState(false);
  const noScrollAreaRef = useRef<HTMLDivElement>(null);
  const scaleLineRef = useRef<HTMLDivElement>(null);
  const scaleCounterRef = useRef<HTMLDivElement>(null);


  // Handle slider change
  const handleSliderChange = (value: number) => {
    setSliderValue(value);
  };

  // Handle lock toggle
  useEffect(() => {
    const wrapper = document.querySelector(".deviceFeature-wrapper");
    if (wrapper) {
      if (isLocked) {
        wrapper.classList.add("locked");
      } else {
        wrapper.classList.remove("locked");
      }
    }
  }, [isLocked]);

  // Prevent scroll in slider area
  useEffect(() => {
    const blockScrollDiv = noScrollAreaRef.current;
    if (blockScrollDiv) {
      const preventScroll = (e: WheelEvent | TouchEvent) => {
        e.preventDefault();
      };
      blockScrollDiv.addEventListener("wheel", preventScroll, { passive: false });
      blockScrollDiv.addEventListener("touchmove", preventScroll, { passive: false });
      return () => {
        blockScrollDiv.removeEventListener("wheel", preventScroll);
        blockScrollDiv.removeEventListener("touchmove", preventScroll);
      };
    }
  }, []);

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap');
        @import url('https://fonts.googleapis.com/icon?family=Material+Icons');

        * {
          box-sizing: border-box;
          font-family: "Montserrat", sans-serif;
        }

        :root {
          --clr-white: #ffffff;
          --clr-dark: #000000;
          --clr-darkLight: #171717;
          --clr-primary: #FBBB32;
          --clr-light: #dddddd;
          --clr-gray: #55524D;
          --clr-border: #543E10;
          --clr-border-gray: #212121;
        }

        body {
          position: fixed;
          height: 100%;
          width: 100%;
          overflow: auto;
          overflow-x: hidden;
          font-size: 14px;
          line-height: 1.5;
          display: flex;
          flex-direction: column;
          background: #080808;
        }

        p {
          font-size: 14px;
          margin: 0 0 15px;
          color: var(--clr-light);
          line-height: 24px;
        }

        a {
          transition: 0.3s ease-in-out;
          color: var(--clr-white);
          text-decoration: none;
        }

        a:hover {
          color: var(--clr-white);
          text-decoration: none;
        }

        img {
          max-width: 100%;
        }

        ::-webkit-scrollbar-track {
          border-radius: 5px;
        }

        ::-webkit-scrollbar {
          width: 4px;
        }

        ::-webkit-scrollbar-thumb {
          border-radius: 5px;
          background-color: #333;
        }

        .bodyLayout {
          height: 100%;
          position: relative;
          width: 100%;
          max-width: 500px;
          margin: auto;
          background: var(--clr-dark);
          overflow: hidden;
        }

        .scrollBody {
          max-height: 100%;
          overflow-x: hidden;
          overflow-y: auto;
          padding: 20px;
        }

        .backBtn {
          position: absolute;
          top: 20px;
          left: 20px;
          width: 34px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 100%;
          background: var(--clr-darkLight);
          z-index: 99;
        }

        .backBtn i {
          font-size: 18px;
          color: var(--clr-light);
        }

        .ourProducts-wrapper {
          display: flex;
          flex-direction: column;
        }

        .bottom-circleGroup,
        .topCircle-effects .circle30,
        .topCircle-effects .circle15,
        .topCircle-effects .circleGroup {
          position: absolute;
          width: 30px;
          height: 30px;
          border-radius: 100%;
          background: #0c0c0c;
          right: 50px;
          top: 30px;
          z-index: 0;
          pointer-events: none;
        }

        .topCircle-effects .circle15 {
          width: 15px;
          height: 15px;
          right: auto;
          left: 20px;
          top: 85px;
        }

        .bottom-circleGroup,
        .topCircle-effects .circleGroup {
          width: 120px;
          height: 120px;
          top: 90px;
          right: -10px;
        }

        .bottom-circleGroup:after,
        .topCircle-effects .circleGroup:after {
          content: "";
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 100%;
          background: var(--clr-darkLight);
          top: 20px;
          left: 20px;
        }

        .bottom-circleGroup {
          top: auto;
          right: auto;
          left: -20px;
          bottom: 70px;
        }

        .bottom-circleGroup:after {
          left: auto;
          right: 50px;
        }

        .device-wrapper .topCircle-effects .circleGroup:after {
          left: 50px;
        }

        .ourProducts-wrapper .brandLogo {
          text-align: center;
          margin: 40px 0 30px;
          padding: 0 20px;
          position: relative;
          z-index: 1;
        }

        .ourProducts-wrapper .brandLogo img {
          width: 130px;
        }

        .device-scrollBody {
          padding: 0 0 20px;
          position: relative;
        }

        .deviceDetails-card {
          padding: 0 20px 20px;
          position: relative;
          z-index: 1;
        }

        .deviceTitle-details {
          display: flex;
          justify-content: space-between;
          padding-bottom: 20px;
          margin-bottom: 20px;
          border-bottom: 1px solid var(--clr-border-gray);
        }

        .TitleInfo h1 {
          font-size: 24px;
          color: var(--clr-white);
          font-weight: 600;
          margin: 0 0 15px;
        }

        .TitleInfo h1:after {
          content: '';
          display: block;
          width: 60px;
          height: 1px;
          background: linear-gradient(90deg, rgba(174, 174, 174, 1) 0%, rgba(83, 83, 83, 0) 100%);
          margin-top: 10px;
        }

        .TitleInfo h1::first-letter {
          color: var(--clr-primary);
        }

        .TitleInfo h6 {
          color: var(--clr-light);
          font-size: 14px;
        }

        .mb-0 {
          margin-bottom: 0;
        }

        .deviceTop-btns {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          justify-content: space-between;
        }

        .category-label {
          font-size: 10px;
          font-weight: 600;
          padding: 5px 15px;
          text-transform: uppercase;
          color: var(--clr-primary);
          border: 1px solid var(--clr-primary);
          border-radius: 20px;
          line-height: normal;
          margin: 0 0 10px 0;
        }

        .ThemeBtn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--clr-primary);
          color: var(--clr-white);
          cursor: pointer;
          padding: 5px 20px;
          gap: 5px;
          min-width: fit-content;
          min-height: 50px;
          min-width: 130px;
          border-radius: 50px;
          background: none;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.5s ease-in-out;
          outline: none;
          text-transform: uppercase;
          background: linear-gradient(90deg, rgba(251, 187, 50, 1) 0%, rgba(38, 26, 0, 1) 100%);
          text-decoration: none;
          white-space: nowrap;
        }

        .btn-xs {
          font-size: 10px;
          padding: 6px 20px;
          min-width: fit-content;
          min-height: auto;
        }

        .puffBtns-group {
          display: flex;
          align-items: center;
          justify-content: space-evenly;
        }

        .puffBtn input {
          display: none;
        }

        .puffBtn label {
          position: relative;
          border: 1px solid #333;
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 100%;
          background: var(--clr-darkLight);
          box-shadow: 0 -3px 3px inset #000;
          transition: all 0.3s ease-in-out;
          cursor: pointer;
        }

        .puffBtn label:before {
          content: "";
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 45px;
          height: 45px;
          border-radius: 100%;
          background: linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.75) 0%,
            rgba(255, 255, 255, 0.1) 30%,
            rgba(255, 255, 255, 0) 100%
          );
          opacity: 0;
          transition: all 0.3s ease-in-out;
        }

        .puffBtn label::after {
          content: "";
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 60px;
          height: 60px;
          border-radius: 100%;
          border: 1px dashed var(--clr-primary);
          opacity: 0;
          transition: all 0.3s ease-in-out;
        }

        .puffBtn label img {
          margin-left: -5px;
        }

        .puffBtn input:checked + label {
          border: 0;
          background: linear-gradient(
            180deg,
            rgba(251, 187, 50, 1) 0%,
            rgba(149, 111, 30, 1) 100%
          );
          box-shadow: 0 -3px 4px inset rgba(0, 0, 0, 0.7);
        }

        .puffBtn input:checked + label::after {
          opacity: 1;
        }

        .puffBtn input:checked + label::before {
          opacity: 1;
        }

        .deviceInfo {
          display: flex;
          gap: 16px;
          margin: 30px 0;
        }

        .deviceInfo .deviceThumb {
          line-height: 0;
          display: flex;
          align-items: center;
        }

        .deviceInfo .deviceThumb img {
          height: 200px;
          object-fit: contain;
        }

        .deviceInfo-singleFlavor .deviceThumb img {
          width: 115px;
        }

        .deviceFeature-card {
          flex: 1;
          background: var(--clr-darkLight);
          border-radius: 10px;
          padding: 10px 15px 15px;
          display: flex;
          flex-direction: column;
        }

        .deviceFeature-head {
          display: flex;
          justify-content: space-between;
          padding-bottom: 10px;
          border-bottom: 1px solid var(--clr-border-gray);
          margin-bottom: 15px;
        }

        .deviceFeature-wrapper {
          display: flex;
          align-items: center;
          flex: auto;
          justify-content: center;
          flex-direction: column;
        }

        .deviceFeature-wrapper.locked {
          opacity: 0.5;
          pointer-events: none;
          filter: grayscale(100%);
          transition: 0.3s ease;
        }

        .deviceFeature-wrapper.locked::after {
          content: "Device is locked";
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgb(0 0 0 / 90%);
          color: #fff;
          padding: 10px 20px;
          border-radius: 8px;
          font-size: 14px;
          width: 100%;
          text-align: center;
          z-index: 9;
        }

        .lockDevice {
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .lockDevice h6 {
          margin: 0;
          color: var(--clr-white);
          text-transform: uppercase;
          line-height: 20px;
          font-size: 10px;
        }

        .batteryInfo {
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .batteryInfo h6 {
          font-size: 10px;
          margin: 0;
          color: var(--clr-white);
        }

        .batteryInfo i {
          writing-mode: sideways-lr;
          color: var(--clr-light);
          font-size: 20px;
        }

        .deviceFeature-body {
          display: flex;
          justify-content: space-between;
          width: 100%;
        }

        .deviceInfo-singleFlavor .deviceFeature-body {
          justify-content: center;
          gap: 20px;
        }

        .deviceFeature-item {
          display: flex;
          gap: 14px;
        }

        .deviceFeature-item input[type="range"] {
          writing-mode: bt-lr;
          -webkit-appearance: slider-vertical;
          width: 6px;
          height: 145px;
          background: #272727;
          outline: none;
          border-radius: 10px;
          position: relative;
        }

        .deviceFeature-item input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: var(--clr-primary);
          cursor: pointer;
          position: relative;
        }

        .deviceFeature-item input[type="range"]::-webkit-slider-thumb::after {
          content: "";
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--clr-dark);
        }

        .deviceFeature-item input[type="range"]::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: var(--clr-primary);
          cursor: pointer;
          border: none;
        }

        .jarFrame {
          position: relative;
          width: 30px;
          height: calc(100% - 4px);
          border: 2px solid #5b5b5b;
          border-bottom: 0;
          background: linear-gradient(
            90deg,
            rgba(120, 120, 120, 1) 0%,
            rgba(196, 196, 196, 1) 25%,
            rgba(120, 120, 120, 1) 50%,
            rgba(196, 196, 196, 1) 75%,
            rgba(120, 120, 120, 1) 100%
          );
        }

        .jarFrame:after {
          content: "";
          position: absolute;
          border-bottom: 4px solid #5b5b5b;
          border-left: 5px solid transparent;
          border-right: 5px solid transparent;
          height: 0;
          width: 30px;
          bottom: -4px;
          left: -2px;
          transform: rotate(180deg);
          box-shadow: 0 -5px 10px #000;
        }

        .jarFrame .jarFill {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 0%;
          background: linear-gradient(
            90deg,
            rgba(174, 75, 179, 1) 0%,
            rgba(202, 111, 204, 1) 25%,
            rgba(174, 75, 179, 1) 50%,
            rgba(202, 111, 204, 1) 75%,
            rgba(174, 75, 179, 1) 100%
          );
          transition: height 0.3s ease;
          box-shadow: 0 5px 10px -2px rgb(0 0 0 / 50%);
          z-index: 1;
        }

        .jarFrame .otherFlavor {
          background: linear-gradient(
            90deg,
            rgba(251, 187, 50, 1) 0%,
            rgba(255, 218, 139, 1) 25%,
            rgba(251, 187, 50, 1) 50%,
            rgba(255, 218, 139, 1) 75%,
            rgba(251, 187, 50, 1) 100%
          );
        }

        .deviceFeature-scale {
          display: flex;
          gap: 5px;
        }

        .deviceInfo-singleFlavor .deviceFeature-scale {
          gap: 8px;
        }

        .scale-counter {
          display: flex;
          flex-direction: column;
          height: 100%;
          font-size: 7px;
          align-items: flex-end;
          color: var(--clr-white);
          margin-top: 0px;
          justify-content: space-between;
        }

        .scale-counter._left {
          align-items: flex-start;
        }

        .scale-line-group {
          position: relative;
        }

        .left-scaleFill {
          position: absolute;
          width: 5px;
          height: 0%;
          max-block-size: calc(100% - 2px);
          bottom: 1px;
          left: 100%;
          background: green;
          z-index: 1;
          transform: translateX(calc(-50% - 4px));
          transition: height 0.3s ease;
        }

        .scale-line {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 5px;
          height: 145px;
          position: relative;
        }

        .deviceInfo-singleFlavor .scale-line {
          align-items: flex-end;
        }

        .scale-line:after {
          content: "";
          position: absolute;
          height: 100%;
          width: 1px;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          background: #424242;
        }

        .deviceInfo-singleFlavor .scale-line:after {
          left: auto;
          right: 0;
          transform: translateX(0);
          width: 2px;
        }

        .scale-line span {
          display: block;
          height: 1px;
          background: #424242;
          width: 24px;
        }

        .deviceInfo-singleFlavor .scale-line span {
          width: 16px;
        }

        .scale-line span:nth-child(even) {
          width: 16px;
        }

        .deviceInfo-singleFlavor .scale-line span:nth-child(even) {
          width: 10px;
        }

        .deviceDescription h6 {
          font-size: 18px;
          color: var(--clr-white);
          padding-bottom: 10px;
          margin: 0 0 10px;
          border-bottom: 1px solid var(--clr-border-gray);
        }

        .deviceDescription p {
          font-size: 13px;
          color: var(--clr-light);
        }

        .deviceDescription p:last-child {
          margin: 0;
        }

        .toggleSwitch {
          display: inline-flex;
        }

        .toggleSwitch input[type=checkbox] {
          display: none;
        }

        .toggleSwitch label {
          cursor: pointer;
          width: 32px;
          height: 16px;
          background: var(--clr-gray);
          display: block;
          border-radius: 30px;
          position: relative;
          transition: all 0.3s ease-in-out;
        }

        .toggleSwitch label::after {
          content: "";
          position: absolute;
          top: 2px;
          left: 2px;
          width: 12px;
          height: 12px;
          background: var(--clr-white);
          border-radius: 30px;
          transition: all 0.3s ease-in-out;
        }

        .toggleSwitch input[type=checkbox]:checked+label {
          background: var(--clr-primary);
        }

        .toggleSwitch input[type=checkbox]:checked+label::after {
          left: calc(100% - 2px);
          transform: translateX(-100%);
          box-shadow: -3px 0 5px rgb(0 0 0 / 20%);
        }

        .bottom-nav {
          padding: 10px;
          position: relative;
          margin-top: auto;
        }

        .bottom-nav::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 150px;
          background: linear-gradient(180deg, rgb(0 0 0 / 0%) 0%, rgb(0 0 0) 50% 80%, rgb(0 0 0) 100%);
        }

        .bottom-navbar {
          display: flex;
          align-items: center;
          justify-content: space-around;
          min-height: 60px;
          border-radius: 15px;
          background: var(--clr-primary);
          box-shadow: 0 -4px 10px inset rgb(0 0 0 / 70%);
          position: relative;
          z-index: 1;
        }

        .bottom-navbar .bottom-navIcon {
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--clr-dark);
          border-radius: 100%;
          box-shadow: 0 5px 10px rgb(0 0 0 / 40%);
        }

        .centerNav {
          padding: 10px;
          background: var(--clr-dark);
          border-radius: 100%;
          margin-top: -50px;
          position: relative;
        }

        .centerNav::after,
        .centerNav::before {
          content: '';
          position: absolute;
          bottom: -4px;
          left: -22px;
          width: 30px;
          background: url(/left-curve.png) top center no-repeat;
          height: 50px;
        }

        .centerNav::after {
          left: auto;
          right: -22px;
          background: url(/right-curve.png) top center no-repeat;
        }

        .centerNav .bottom-navIcon {
          width: 60px;
          height: 60px;
          background: var(--clr-primary);
          box-shadow: 0 -4px 5px inset rgba(0, 0, 0, 0.7);
          position: relative;
        }

        .centerNav .bottom-navIcon:after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 50px;
          height: 50px;
          border-radius: 100%;
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.75) 0%, rgba(255, 255, 255, 0.1) 30%, rgba(255, 255, 255, 0) 100%);
        }

        .modal {
          display: none;
          position: fixed;
          z-index: 1000;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          overflow: auto;
          background-color: rgba(0, 0, 0, 0.8);
        }

        .modal.show {
          display: flex;
          align-items: flex-end;
        }

        .scan-popup {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: flex-end;
          justify-content: center;
        }

        .modal.fade .scan-popup .modal-dialog {
          margin: 0;
          width: 100%;
          max-width: 500px;
          transform: translate(0, 100px);
          transition: transform 0.3s ease;
        }

        .modal.show .scan-popup .modal-dialog {
          transform: none;
        }

        .scan-popup .modal-dialog {
          position: relative;
          width: 100%;
          max-width: 500px;
        }

        .scan-popup .modal-dialog .modal-content {
          border-radius: 30px 30px 0 0;
          background: var(--clr-white);
          width: 100%;
        }

        .modal-body {
          padding: 40px 30px;
          position: relative;
        }

        .pop-btn-close {
          position: absolute;
          right: 40px;
          top: -5px;
          border: 0;
          background: #ce2f2f;
          width: 24px;
          height: 35px;
          border-radius: 2px 0 35px 35px;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          box-shadow: 1px 0 4px rgb(0 0 0 / 30%);
          cursor: pointer;
        }

        .pop-btn-close:after {
          content: "";
          position: absolute;
          top: 0;
          left: 100%;
          width: 0;
          height: 0;
          border-bottom: 5px solid #ce2f2f;
          border-right: 10px solid transparent;
          z-index: -1;
        }

        .pop-btn-close i {
          font-size: 14px;
          background: var(--clr-white);
          border-radius: 100%;
          color: #ce2f2f;
          margin-bottom: 3px;
          padding: 2px;
        }

        .centerTitle {
          text-align: center;
          margin: 0 0 20px;
        }

        .centerTitle h1 {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .centerTitle h1:after {
          background: linear-gradient(90deg, rgba(174, 174, 174, 0) 0%, rgba(174, 174, 174, 1) 50%, rgba(174, 174, 174, 0) 100%);
        }

        .scan-modal-content h1 {
          color: var(--clr-dark);
          font-size: 18px;
        }

        .scan-modal-content p {
          color: var(--clr-dark);
        }

        .scan-modal-content {
          text-align: center;
        }

        .scan-modal-content img {
          display: block;
          margin: 0 auto 15px auto;
        }

        @media (min-width: 568px) {
          .bodyLayout {
            margin: 5px auto;
            border-radius: 20px;
            border: 10px solid var(--clr-darkLight);
          }

          .ourProducts-wrapper .brandLogo {
            margin: 20px 0 40px;
          }

          .ourProducts-wrapper .brandLogo img {
            width: 150px;
          }

          .btn-xs {
            font-size: 12px;
            padding: 8px 20px;
          }

          .deviceInfo {
            gap: 30px;
            margin: 40px 0 30px;
          }

          .deviceFeature-card {
            padding: 15px 20px 20px;
          }

          .deviceFeature-head {
            padding-bottom: 15px;
            margin-bottom: 20px;
          }

          .TitleInfo h1 {
            font-size: 28px;
          }

          .TitleInfo h6 {
            font-size: 18px;
          }

          .category-label {
            font-size: 14px;
            padding: 5px 20px;
          }

          .puffBtn label {
            width: 60px;
            height: 60px;
          }

          .puffBtn label:before {
            width: 50px;
            height: 50px;
          }

          .puffBtn label::after {
            width: 70px;
            height: 70px;
            border: 2px dashed var(--clr-primary);
          }

          .lockDevice h6,
          .batteryInfo h6 {
            font-size: 14px;
          }

          .batteryInfo i {
            font-size: 24px;
          }

          .toggleSwitch label {
            width: 40px;
            height: 20px;
          }

          .toggleSwitch label::after {
            width: 16px;
            height: 16px;
          }

          .deviceInfo .deviceThumb img {
            height: 250px;
          }

          .deviceFeature-item {
            gap: 15px;
          }

          .deviceDescription h6 {
            font-size: 24px;
          }

          .deviceDescription p {
            font-size: 16px;
          }

          .bottom-navbar .bottom-navIcon {
            width: 50px;
            height: 50px;
          }

          .bottom-navbar .bottom-navIcon img {
            width: 22px;
          }

          .bottom-navbar {
            min-height: 70px;
          }

          .centerNav .bottom-navIcon {
            width: 70px;
            height: 70px;
          }

          .centerNav .bottom-navIcon:after {
            width: 60px;
            height: 60px;
          }

          .centerNav::after,
          .centerNav::before {
            bottom: 5px;
            left: -23px;
          }

          .centerNav::after {
            left: auto;
            right: -23px;
          }

          .jarFrame,
          .jarFrame:after {
            width: 40px;
          }

          .modal.fade .scan-popup .modal-dialog {
            margin: 0 auto;
            padding: 0 10px;
            max-width: 500px;
          }

          .deviceFeature-scale {
            gap: 10px;
          }
        }
      `}</style>

      <section className="bodyLayout ourProducts-wrapper device-wrapper">
        <div className="bottom-circleGroup"></div>
        <div className="scrollBody device-scrollBody">
          <Link href="/" className="backBtn">
            <i className="material-icons">keyboard_backspace</i>
          </Link>

          <div className="topCircle-effects">
            <span className="circle30"></span>
            <span className="circle15"></span>
            <div className="circleGroup"></div>
          </div>

          <div className="brandLogo">
            <Image src="/logo.png" alt="Waxx Logo" width={130} height={50} priority />
          </div>

          <div className="deviceDetails-card">
            <div className="deviceTitle-details">
              <div className="TitleInfo">
                <h1>Single Flavor</h1>
                <h6 className="mb-0">LIVE DIAMONDS DEVICE</h6>
              </div>

              <div className="deviceTop-btns">
                <h6 className="category-label">Indica</h6>
                <a href="#" target="_blank" className="ThemeBtn btn-xs" onClick={(e) => e.preventDefault()}>
                  Test results
                </a>
              </div>
            </div>

            <div className="puffBtns-group">
              <div className="puffBtn">
                <input
                  type="radio"
                  name="puffbtn"
                  id="singlePuff"
                  checked={selectedPuff === "singlePuff"}
                  onChange={() => setSelectedPuff("singlePuff")}
                />
                <label htmlFor="singlePuff">
                  <img src="/1Puff.png" alt="1 Puff" />
                </label>
              </div>

              <div className="puffBtn">
                <input
                  type="radio"
                  name="puffbtn"
                  id="twoPuff"
                  checked={selectedPuff === "twoPuff"}
                  onChange={() => setSelectedPuff("twoPuff")}
                />
                <label htmlFor="twoPuff">
                  <img src="/2Puff.png" alt="2 Puff" />
                </label>
              </div>

              <div className="puffBtn">
                <input
                  type="radio"
                  name="puffbtn"
                  id="threePuff"
                  checked={selectedPuff === "threePuff"}
                  onChange={() => setSelectedPuff("threePuff")}
                />
                <label htmlFor="threePuff">
                  <img src="/3Puff.png" alt="3 Puff" />
                </label>
              </div>

              <div className="puffBtn">
                <input
                  type="radio"
                  name="puffbtn"
                  id="fourPuff"
                  checked={selectedPuff === "fourPuff"}
                  onChange={() => setSelectedPuff("fourPuff")}
                />
                <label htmlFor="fourPuff">
                  <img src="/4Puff.png" alt="4 Puff" />
                </label>
              </div>
            </div>

            <div className="deviceInfo deviceInfo-singleFlavor">
              <div className="deviceThumb">
                <img src="/single-flavor-device.png" alt="Single Flavor Device" />
              </div>

              <div className="deviceFeature-card">
                <div className="deviceFeature-head">
                  <div className="lockDevice">
                    <h6>Lock</h6>
                    <div className="toggleSwitch">
                      <input
                        type="checkbox"
                        id="lock_device"
                        checked={isLocked}
                        onChange={(e) => setIsLocked(e.target.checked)}
                      />
                      <label htmlFor="lock_device"></label>
                    </div>
                  </div>

                  <div className="batteryInfo">
                    <h6>{batteryLevel}%</h6>
                    <i className="material-icons">battery_charging_full</i>
                  </div>
                </div>

                <div className={`deviceFeature-wrapper ${isLocked ? "locked" : ""}`}>
                  <div className="deviceFeature-body no-scroll-area" ref={noScrollAreaRef}>
                    <div className="deviceFeature-item _leftItem">
                      <input
                        type="range"
                        data-orientation="vertical"
                        min="0"
                        max="100"
                        value={sliderValue}
                        onChange={(e) => handleSliderChange(parseInt(e.target.value))}
                        disabled={isLocked}
                      />
                      <div className="jarFrame">
                        <div
                          className="jarFill otherFlavor"
                          style={{ height: `${sliderValue}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="deviceFeature-scale">
                      <div className="scale-counter _left" ref={scaleCounterRef}>
                        {Array.from({ length: 11 }, (_, i) => 100 - i * 10).map((num) => (
                          <span key={num}>{num}</span>
                        ))}
                      </div>
                      <div className="scale-line-group">
                        <div
                          className="left-scaleFill"
                          style={{ height: `${sliderValue}%` }}
                        ></div>
                        <div className="scale-line" ref={scaleLineRef}>
                          {Array.from({ length: 25 }).map((_, i) => (
                            <span key={i}></span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="deviceDescription">
              <h6>About Product</h6>
              <p>
                In the true spirit of Waxx Barz, our Butter Cake strain turns
                cannabis consumption into a delightful
              </p>
            </div>
          </div>
        </div>

        <div className="bottom-nav">
          <div className="bottom-navbar">
            <a href="#" className="bottom-navIcon" onClick={(e) => e.preventDefault()}>
              <img src="/settings.svg" alt="Settings" />
            </a>

            <div className="centerNav">
              <a
                href="#"
                className="bottom-navIcon"
                onClick={(e) => {
                  e.preventDefault();
                  setShowModal(true);
                }}
              >
                <img src="/nfc.svg" alt="NFC Scan" />
              </a>
            </div>

            <Link href="/" className="bottom-navIcon">
              <img src="/home.svg" alt="Home" />
            </Link>
          </div>
        </div>
      </section>

      <div
        className={`modal ${showModal ? "show" : ""}`}
        onClick={() => setShowModal(false)}
      >
        <div className="scan-popup" onClick={(e) => e.stopPropagation()}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-body">
                <button
                  type="button"
                  className="pop-btn-close"
                  onClick={() => setShowModal(false)}
                  aria-label="Close"
                >
                  <i className="material-icons">close</i>
                </button>

                <div className="TitleInfo centerTitle scan-modal-content">
                  <img src="/nfc-scan-icon.svg" alt="NFC Scan Icon" />
                  <h1>Ready to scan</h1>
                  <p>
                    Reader is located along the middle of the <br />
                    backside of your phone
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
