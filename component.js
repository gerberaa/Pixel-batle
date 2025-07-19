// <stdin>
import React, { useState, useRef, useEffect, useCallback } from "https://esm.sh/react@18.2.0";
var { useStoredState, useUser } = hatch;
var CANVAS_SIZE = 250;
var COOLDOWN_TIME = 5 * 60 * 1e3;
var ZOOM_FACTOR = 1.2;
var MIN_ZOOM = 0.5;
var MAX_ZOOM = 50;
var COLORS = [
  "#FFFFFF",
  "#E4E4E4",
  "#888888",
  "#222222",
  "#FFA7D1",
  "#E50000",
  "#E59500",
  "#A06A42",
  "#E5D900",
  "#94E044",
  "#02BE01",
  "#00D3DD",
  "#0083C7",
  "#0000EA",
  "#CF6EE4",
  "#820080"
];
var PixelPlaceGame = () => {
  const user = useUser();
  const canvasRef = useRef(null);
  const [pixelData, setPixelData] = useStoredState("pixelData", {});
  const [lastPlaceTime, setLastPlaceTime] = useStoredState(`lastPlace_${user.id}`, 0);
  const [selectedColor, setSelectedColor] = useState("#E50000");
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(100);
  const [panY, setPanY] = useState(100);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  useEffect(() => {
    const updateCooldown = () => {
      const now = Date.now();
      const remaining = Math.max(0, lastPlaceTime + COOLDOWN_TIME - now);
      setCooldownRemaining(remaining);
    };
    updateCooldown();
    const interval = setInterval(updateCooldown, 1e3);
    return () => clearInterval(interval);
  }, [lastPlaceTime]);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    ctx.fillStyle = "#F8F8F8";
    ctx.fillRect(0, 0, rect.width, rect.height);
    const startX = Math.floor(-panX / zoom);
    const startY = Math.floor(-panY / zoom);
    const endX = Math.ceil((rect.width - panX) / zoom);
    const endY = Math.ceil((rect.height - panY) / zoom);
    const checkerSize = Math.max(1, zoom / 4);
    if (zoom > 1) {
      for (let x = Math.max(0, startX); x <= Math.min(CANVAS_SIZE - 1, endX); x++) {
        for (let y = Math.max(0, startY); y <= Math.min(CANVAS_SIZE - 1, endY); y++) {
          if ((x + y) % 2 === 0) {
            ctx.fillStyle = "#FFFFFF";
          } else {
            ctx.fillStyle = "#F0F0F0";
          }
          const screenX = x * zoom + panX;
          const screenY = y * zoom + panY;
          ctx.fillRect(screenX, screenY, zoom, zoom);
        }
      }
    }
    if (zoom > 3) {
      ctx.strokeStyle = zoom > 10 ? "#AAAAAA" : "#DDDDDD";
      ctx.lineWidth = zoom > 15 ? 1 : 0.5;
      for (let x = Math.max(0, startX); x <= Math.min(CANVAS_SIZE, endX + 1); x++) {
        const screenX = x * zoom + panX;
        ctx.beginPath();
        ctx.moveTo(screenX, 0);
        ctx.lineTo(screenX, rect.height);
        ctx.stroke();
      }
      for (let y = Math.max(0, startY); y <= Math.min(CANVAS_SIZE, endY + 1); y++) {
        const screenY = y * zoom + panY;
        ctx.beginPath();
        ctx.moveTo(0, screenY);
        ctx.lineTo(rect.width, screenY);
        ctx.stroke();
      }
    }
    for (let x = Math.max(0, startX); x <= Math.min(CANVAS_SIZE - 1, endX); x++) {
      for (let y = Math.max(0, startY); y <= Math.min(CANVAS_SIZE - 1, endY); y++) {
        const pixelKey = `${x},${y}`;
        const pixelColor = pixelData[pixelKey];
        if (pixelColor) {
          ctx.fillStyle = pixelColor;
          const screenX = x * zoom + panX;
          const screenY = y * zoom + panY;
          ctx.fillRect(screenX, screenY, zoom, zoom);
          if (zoom > 8) {
            ctx.strokeStyle = "#00000020";
            ctx.lineWidth = 0.5;
            ctx.strokeRect(screenX, screenY, zoom, zoom);
          }
        }
      }
    }
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2;
    ctx.strokeRect(panX, panY, CANVAS_SIZE * zoom, CANVAS_SIZE * zoom);
  }, [pixelData, zoom, panX, panY]);
  const getCanvasCoordinates = (clientX, clientY) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((clientX - rect.left - panX) / zoom);
    const y = Math.floor((clientY - rect.top - panY) / zoom);
    return { x, y };
  };
  const handleCanvasClick = (e) => {
    if (isDragging) return;
    if (cooldownRemaining > 0) return;
    if (e.button !== 0) return;
    const { x, y } = getCanvasCoordinates(e.clientX, e.clientY);
    if (x >= 0 && x < CANVAS_SIZE && y >= 0 && y < CANVAS_SIZE) {
      const pixelKey = `${x},${y}`;
      setPixelData((prev) => ({
        ...prev,
        [pixelKey]: selectedColor
      }));
      setLastPlaceTime(Date.now());
    }
  };
  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(false);
    setDragStart({ x: e.clientX - panX, y: e.clientY - panY });
  };
  const handleMouseMove = (e) => {
    if (e.buttons === 1) {
      const newPanX = e.clientX - dragStart.x;
      const newPanY = e.clientY - dragStart.y;
      if (Math.abs(newPanX - panX) > 3 || Math.abs(newPanY - panY) > 3) {
        setIsDragging(true);
      }
      setPanX(newPanX);
      setPanY(newPanY);
    }
  };
  const handleMouseUp = (e) => {
    setTimeout(() => setIsDragging(false), 50);
  };
  const handleContextMenu = (e) => {
    e.preventDefault();
  };
  const handleRightClick = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const newZoom = Math.min(MAX_ZOOM, zoom * ZOOM_FACTOR);
    const worldX = (mouseX - panX) / zoom;
    const worldY = (mouseY - panY) / zoom;
    const newPanX = mouseX - worldX * newZoom;
    const newPanY = mouseY - worldY * newZoom;
    setZoom(newZoom);
    setPanX(newPanX);
    setPanY(newPanY);
  };
  const handleWheel = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const worldX = (mouseX - panX) / zoom;
    const worldY = (mouseY - panY) / zoom;
    let newZoom;
    if (e.buttons === 2 || e.shiftKey) {
      newZoom = Math.max(MIN_ZOOM, zoom / ZOOM_FACTOR);
    } else {
      const delta = e.deltaY > 0 ? 1 / 1.1 : 1.1;
      newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom * delta));
    }
    const newPanX = mouseX - worldX * newZoom;
    const newPanY = mouseY - worldY * newZoom;
    setZoom(newZoom);
    setPanX(newPanX);
    setPanY(newPanY);
  };
  const formatTime = (ms) => {
    const minutes = Math.floor(ms / 6e4);
    const seconds = Math.floor(ms % 6e4 / 1e3);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };
  const resetView = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    setZoom(Math.min(rect.width / CANVAS_SIZE, rect.height / CANVAS_SIZE) * 0.8);
    setPanX(centerX - CANVAS_SIZE * zoom / 2);
    setPanY(centerY - CANVAS_SIZE * zoom / 2);
  };
  return /* @__PURE__ */ React.createElement("div", { className: "w-full h-full flex flex-col bg-gray-100" }, /* @__PURE__ */ React.createElement("div", { className: "bg-white border-b p-4 flex items-center justify-between" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h1", { className: "text-2xl font-bold text-gray-800" }, "Pixel Place"), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-gray-600" }, "250\xD7250 collaborative pixel canvas")), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-4" }, /* @__PURE__ */ React.createElement("div", { className: "text-center" }, cooldownRemaining > 0 ? /* @__PURE__ */ React.createElement("div", { className: "text-red-600" }, /* @__PURE__ */ React.createElement("div", { className: "text-xs" }, "\u041D\u0430\u0441\u0442\u0443\u043F\u043D\u0438\u0439 \u043F\u0456\u043A\u0441\u0435\u043B\u044C \u0447\u0435\u0440\u0435\u0437:"), /* @__PURE__ */ React.createElement("div", { className: "font-mono font-bold" }, formatTime(cooldownRemaining))) : /* @__PURE__ */ React.createElement("div", { className: "text-green-600 font-bold" }, "\u0413\u043E\u0442\u043E\u0432\u043E \u0434\u043E \u0440\u043E\u0437\u043C\u0456\u0449\u0435\u043D\u043D\u044F!")), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: resetView,
      className: "px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
    },
    "\u0421\u043A\u0438\u043D\u0443\u0442\u0438 \u0432\u0438\u0434"
  ))), /* @__PURE__ */ React.createElement("div", { className: "bg-white border-b p-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement("span", { className: "text-sm font-medium text-gray-700" }, "\u041A\u043E\u043B\u0456\u0440:"), /* @__PURE__ */ React.createElement("div", { className: "flex gap-1" }, COLORS.map((color) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: color,
      onClick: () => setSelectedColor(color),
      className: `w-8 h-8 border-2 rounded ${selectedColor === color ? "border-gray-800" : "border-gray-300"}`,
      style: { backgroundColor: color },
      title: color
    }
  ))), /* @__PURE__ */ React.createElement("div", { className: "ml-4 text-sm text-gray-600" }, "\u041E\u0431\u0440\u0430\u043D\u0438\u0439: ", /* @__PURE__ */ React.createElement("span", { className: "font-mono" }, selectedColor)))), /* @__PURE__ */ React.createElement("div", { className: "flex-1 relative overflow-hidden" }, /* @__PURE__ */ React.createElement(
    "canvas",
    {
      ref: canvasRef,
      className: "absolute inset-0 w-full h-full select-none",
      onMouseDown: handleMouseDown,
      onMouseMove: handleMouseMove,
      onMouseUp: handleMouseUp,
      onClick: handleCanvasClick,
      onContextMenu: handleRightClick,
      onWheel: handleWheel,
      style: {
        cursor: cooldownRemaining > 0 ? "not-allowed" : isDragging ? "grabbing" : "crosshair",
        imageRendering: "pixelated"
      }
    }
  ), /* @__PURE__ */ React.createElement("div", { className: "absolute top-4 left-4 bg-white bg-opacity-90 rounded p-2 text-xs pointer-events-none" }, /* @__PURE__ */ React.createElement("div", null, "\u041C\u0430\u0441\u0448\u0442\u0430\u0431: ", zoom.toFixed(1), "x"), /* @__PURE__ */ React.createElement("div", null, "\u041F\u043E\u0437\u0438\u0446\u0456\u044F \u043F\u043E\u043B\u044F: (", Math.round(-panX / zoom), ", ", Math.round(-panY / zoom), ")"), /* @__PURE__ */ React.createElement("div", null, "\u0412\u0438\u0434\u0438\u043C\u0430 \u043E\u0431\u043B\u0430\u0441\u0442\u044C: ", Math.round((canvasRef.current?.clientWidth || 0) / zoom), "\xD7", Math.round((canvasRef.current?.clientHeight || 0) / zoom), " \u043F\u0456\u043A\u0441\u0435\u043B\u0456\u0432")), /* @__PURE__ */ React.createElement("div", { className: "absolute bottom-4 left-4 bg-white bg-opacity-95 rounded p-3 text-sm max-w-xs shadow-lg pointer-events-none" }, /* @__PURE__ */ React.createElement("div", { className: "font-medium mb-2" }, "\u0423\u043F\u0440\u0430\u0432\u043B\u0456\u043D\u043D\u044F:"), /* @__PURE__ */ React.createElement("ul", { className: "text-xs space-y-1" }, /* @__PURE__ */ React.createElement("li", null, "\u2022 ", /* @__PURE__ */ React.createElement("strong", null, "\u041B\u0456\u0432\u0430 \u043A\u043D\u043E\u043F\u043A\u0430:"), " \u0440\u043E\u0437\u043C\u0456\u0441\u0442\u0438\u0442\u0438 \u043F\u0456\u043A\u0441\u0435\u043B\u044C"), /* @__PURE__ */ React.createElement("li", null, "\u2022 ", /* @__PURE__ */ React.createElement("strong", null, "\u041F\u0435\u0440\u0435\u0442\u044F\u0433\u0443\u0432\u0430\u043D\u043D\u044F:"), " \u043D\u0430\u0432\u0456\u0433\u0430\u0446\u0456\u044F \u043F\u043E \u043F\u043E\u043B\u044E"), /* @__PURE__ */ React.createElement("li", null, "\u2022 ", /* @__PURE__ */ React.createElement("strong", null, "\u041F\u0440\u0430\u0432\u0430 \u043A\u043D\u043E\u043F\u043A\u0430:"), " \u043F\u0440\u0438\u0431\u043B\u0438\u0436\u0435\u043D\u043D\u044F \u0434\u043E \u043A\u0443\u0440\u0441\u043E\u0440\u0443"), /* @__PURE__ */ React.createElement("li", null, "\u2022 ", /* @__PURE__ */ React.createElement("strong", null, "Shift + \u043F\u0440\u043E\u043A\u0440\u0443\u0442\u043A\u0430:"), " \u0432\u0456\u0434\u0434\u0430\u043B\u0435\u043D\u043D\u044F \u0432\u0456\u0434 \u043A\u0443\u0440\u0441\u043E\u0440\u0443"), /* @__PURE__ */ React.createElement("li", null, "\u2022 ", /* @__PURE__ */ React.createElement("strong", null, "\u041F\u0440\u043E\u043A\u0440\u0443\u0442\u043A\u0430:"), " \u0442\u043E\u0447\u043D\u0435 \u043C\u0430\u0441\u0448\u0442\u0430\u0431\u0443\u0432\u0430\u043D\u043D\u044F"), /* @__PURE__ */ React.createElement("li", null, "\u2022 \u041E\u0434\u0438\u043D \u043F\u0456\u043A\u0441\u0435\u043B\u044C \u043A\u043E\u0436\u043D\u0456 5 \u0445\u0432\u0438\u043B\u0438\u043D")))));
};
var stdin_default = PixelPlaceGame;
export {
  stdin_default as default
};
