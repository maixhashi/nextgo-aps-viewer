package domain

type TranslationStatus struct {
    Type         string       `json:"type"`
    HasThumbnail string      `json:"hasThumbnail"`
    Status       string      `json:"status"`
    Progress     string      `json:"progress"`
    Region       string      `json:"region"`
    URN          string      `json:"urn"`
    Derivatives  []Derivative `json:"derivatives"`
}

type Derivative struct {
    Name         string     `json:"name"`
    HasThumbnail string     `json:"hasThumbnail"`
    Status       string     `json:"status"`
    Progress     string     `json:"progress"`
    OutputType   string     `json:"outputType"`
    Children     []Children `json:"children"`
    Messages     []Message  `json:"messages,omitempty"`
}

type Children struct {
    GUID         string     `json:"guid"`
    Type         string     `json:"type"`
    Role         string     `json:"role"`
    Name         string     `json:"name"`
    Status       string     `json:"status"`
    Progress     string     `json:"progress"`
    HasThumbnail string     `json:"hasThumbnail"`
    Children     []Resource `json:"children,omitempty"`
    Messages     []Message  `json:"messages,omitempty"`
}

type Resource struct {
    GUID       string    `json:"guid"`
    Type       string    `json:"type"`
    URN        string    `json:"urn,omitempty"`
    Role       string    `json:"role"`
    Mime       string    `json:"mime"`
    Resolution []float64 `json:"resolution,omitempty"`
}

type Message struct {
    Type    string   `json:"type"`
    Code    string   `json:"code"`
    Message []string `json:"message,omitempty"`
}
