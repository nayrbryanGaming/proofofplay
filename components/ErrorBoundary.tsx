"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: "20px", color: "#ff0000", backgroundColor: "#000000", fontFamily: "monospace", zIndex: 9999, position: "fixed", top: 0, left: 0, right: 0, bottom: 0, overflow: "auto" }}>
                    <h1 style={{ fontSize: "20px", marginBottom: "10px", color: "white" }}>FATAL ERROR (Please show this to AI):</h1>
                    <pre style={{ whiteSpace: "pre-wrap", wordWrap: "break-word" }}>{this.state.error?.message}</pre>
                    <hr style={{ borderColor: "#ff0000", margin: "10px 0" }} />
                    <pre style={{ whiteSpace: "pre-wrap", wordWrap: "break-word", fontSize: "10px", color: "#ff8888" }}>{this.state.error?.stack}</pre>
                </div>
            );
        }

        return this.props.children;
    }
}
