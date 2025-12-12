"""initial schema

Revision ID: 20240911_0001
Revises: 
Create Date: 2024-09-11 00:01:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

from app.modules.observables.schemas import EventStatus, EventType, ObservableStatus

# revision identifiers, used by Alembic.
revision: str = "20240911_0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("username", sa.String(length=255), nullable=False),
        sa.Column("hashed_password", sa.String(length=255), nullable=False),
        sa.Column("role", sa.String(length=50), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            onupdate=sa.func.now(),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_users_id"), "users", ["id"], unique=False)
    op.create_index(op.f("ix_users_username"), "users", ["username"], unique=True)

    op.create_table(
        "observables",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("metadata", sa.JSON(), nullable=False, server_default=sa.text("'{}'")),
        sa.Column("status", sa.Enum(ObservableStatus), nullable=False, server_default=ObservableStatus.STABLE.value),
        sa.Column("utility_x", sa.Float(), nullable=False, server_default="0"),
        sa.Column("utility_y", sa.Float(), nullable=False, server_default="0"),
        sa.Column("utility_distance", sa.Float(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            onupdate=sa.func.now(),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_observables_id"), "observables", ["id"], unique=False)

    op.create_table(
        "events",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("observable_id", sa.Integer(), nullable=False),
        sa.Column("type", sa.Enum(EventType), nullable=False, server_default=EventType.PAST.value),
        sa.Column("status", sa.Enum(EventStatus), nullable=False, server_default=EventStatus.PLANNED.value),
        sa.Column("label", sa.String(length=255), nullable=False),
        sa.Column("description", sa.String(length=1024), nullable=True),
        sa.Column("sequence_index", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("is_cutoff", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("weight", sa.Float(), nullable=False, server_default="1.0"),
        sa.Column("timestamp", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            onupdate=sa.func.now(),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["observable_id"],
            ["observables.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_events_id"), "events", ["id"], unique=False)
    op.create_index("ix_events_observable_sequence", "events", ["observable_id", "sequence_index"])


def downgrade() -> None:
    op.drop_index("ix_events_observable_sequence", table_name="events")
    op.drop_index(op.f("ix_events_id"), table_name="events")
    op.drop_table("events")
    op.drop_index(op.f("ix_observables_id"), table_name="observables")
    op.drop_table("observables")
    op.drop_index(op.f("ix_users_username"), table_name="users")
    op.drop_index(op.f("ix_users_id"), table_name="users")
    op.drop_table("users")
