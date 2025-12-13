from sqlalchemy import JSON, Column, DateTime, Enum, Float, Integer, String, func
from sqlalchemy.orm import relationship

from app.db.base import Base
from app.modules.observables.schemas import ObservableStatus


class Observable(Base):
    __tablename__ = "observables"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    meta = Column("metadata", JSON, nullable=False, default=dict)
    status = Column(Enum(ObservableStatus), nullable=False, default=ObservableStatus.STABLE)
    utility_x = Column(Float, nullable=False, default=0.0)
    utility_y = Column(Float, nullable=False, default=0.0)
    utility_distance = Column(Float, nullable=False, default=0.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    events = relationship("Event", back_populates="observable", cascade="all, delete-orphan")
