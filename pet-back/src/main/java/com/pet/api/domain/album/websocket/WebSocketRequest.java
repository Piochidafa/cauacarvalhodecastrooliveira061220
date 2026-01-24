package com.pet.api.domain.album.websocket;

import java.util.Map;

public class WebSocketRequest {
    private String action;
    private Map<String, Object> data;

    public WebSocketRequest() {
    }

    public WebSocketRequest(String action, Map<String, Object> data) {
        this.action = action;
        this.data = data;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public Map<String, Object> getData() {
        return data;
    }

    public void setData(Map<String, Object> data) {
        this.data = data;
    }
}
