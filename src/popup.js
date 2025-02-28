import React from "react";

const Popup = () => {
  return (
    <div>
      <div className="text-center">
        <h1 className=" font-bold text-3xl text-white">
          Otto <span className="text-whisperOrange">Complete</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          Your Autocompletion Companion
        </p>
      </div>
      <label htmlFor="text" className="text-xs text-muted-foreground">
        Select a model
      </label>
    </div>
  );
};

export default Popup;
