from datetime import datetime
from enum import Enum
from typing import Any, Optional

from pydantic import BaseModel, Field


class ObservableStatus(str, Enum):
    STABLE = "STABLE"
    AT_RISK = "AT_RISK"
    OPTIMIZED = "OPTIMIZED"


class EventType(str, Enum):
    PAST = "PAST"
    PLANNED = "PLANNED"
    OPTIMIZATION = "OPTIMIZATION"


class EventStatus(str, Enum):
    FIXED = "FIXED"
    PLANNED = "PLANNED"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"


class EventRead(BaseModel):
    id: int
    observable_id: int
    type: EventType
    status: EventStatus
    label: str
    description: Optional[str] = None
    sequence_index: int = Field(ge=0)
    is_cutoff: bool = False
    weight: float = 1.0
    timestamp: Optional[str] = None


class EventBase(BaseModel):
    label: str
    type: EventType = EventType.PAST
    status: EventStatus = EventStatus.PLANNED
    description: Optional[str] = None
    sequence_index: int = Field(ge=0, default=0)
    is_cutoff: bool = False
    weight: float = 1.0
    timestamp: Optional[datetime] = None


class EventCreate(EventBase):
    pass


class EventUpdate(BaseModel):
    label: Optional[str] = None
    type: Optional[EventType] = None
    status: Optional[EventStatus] = None
    description: Optional[str] = None
    sequence_index: Optional[int] = Field(default=None, ge=0)
    is_cutoff: Optional[bool] = None
    weight: Optional[float] = None
    timestamp: Optional[datetime] = None


class ObservableBase(BaseModel):
    name: str
    metadata: dict[str, Any] = Field(default_factory=dict)
    status: ObservableStatus = ObservableStatus.STABLE


class ObservableCreate(ObservableBase):
    pass


class ObservableUpdate(BaseModel):
    name: Optional[str] = None
    metadata: Optional[dict[str, Any]] = None
    status: Optional[ObservableStatus] = None


class ObservableRead(ObservableBase):
    id: int
    utility_x: float = 0.0
    utility_y: float = 0.0
    utility_distance: float = 0.0


class ObservableDetail(ObservableRead):
    events: list[EventRead] = Field(default_factory=list)
