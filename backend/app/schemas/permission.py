from pydantic import BaseModel


class JobPermissionSchema(BaseModel):
    job_name: str
    can_view: bool = True
    can_trigger: bool = False

    model_config = {"from_attributes": True}


class UserPermissionsResponse(BaseModel):
    user_id: str
    permissions: list[JobPermissionSchema]


class BulkPermissionUpdate(BaseModel):
    permissions: list[JobPermissionSchema]
