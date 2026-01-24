package com.pet.api.domain.album.websocket;

public class WebSocketResponse {
    private String action;
    private String message;
    private Object data;

    public WebSocketResponse() {
    }

    public WebSocketResponse(String action, String message, Object data) {
        this.action = action;
        this.message = message;
        this.data = data;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Object getData() {
        return data;
    }

    public void setData(Object data) {
        this.data = data;
    }
}
