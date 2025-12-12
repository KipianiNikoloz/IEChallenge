from sqlalchemy import Boolean, Column, DateTime, Enum, Float, ForeignKey, Integer, String, func
from sqlalchemy.orm import relationship

from app.db.base import Base
from app.modules.observables.schemas import EventStatus, EventType


class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    observable_id = Column(Integer, ForeignKey("observables.id", ondelete="CASCADE"), nullable=False)
    type = Column(Enum(EventType), nullable=False, default=EventType.PAST)
    status = Column(Enum(EventStatus), nullable=False, default=EventStatus.PLANNED)
    label = Column(String(255), nullable=False)
    description = Column(String(1024), nullable=True)
    sequence_index = Column(Integer, nullable=False, default=0)
    is_cutoff = Column(Boolean, nullable=False, default=False)
    weight = Column(Float, nullable=False, default=1.0)
    timestamp = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    observable = relationship("Observable", back_populates="events")
