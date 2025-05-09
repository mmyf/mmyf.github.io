class Room {
    constructor(roomObj) {
        this.roomObj = roomObj;
    }

    // 计算门相对于房间的位置
    getRelativeDoorPosition(door) {
        return {
            x: door.position.x - this.roomObj.position.x,
            y: door.position.y - this.roomObj.position.y,
            z: door.position.z - this.roomObj.position.z
        };
    }

    // 判断两个房间的对称关系
    static getSymmetryType(doorPos1, doorPos2) {
        if (Math.abs(doorPos1.x + doorPos2.x) < 0.1 && 
            Math.abs(doorPos1.z - doorPos2.z) < 0.1) {
            return 'x';
        }
        if (Math.abs(doorPos1.x - doorPos2.x) < 0.1 && 
            Math.abs(doorPos1.z + doorPos2.z) < 0.1) {
            return 'z';
        }
        return null;
    }

    // 对物体进行对称变换
    transformObject(obj, symmetryType) {
        // 获取原始物体的基本属性
        const objConfig = {
            type: obj.type,
            position: [...obj.position.toArray()],
            rotation: [...obj.rotation.toArray()],
            style: obj.style
        };

        // 根据对称类型调整位置和旋转
        switch (symmetryType) {
            case 'x':
                objConfig.position[0] *= -1; // x轴反转
                objConfig.rotation[1] = Math.PI - objConfig.rotation[1]; // y轴旋转
                break;
            case 'z':
                objConfig.position[2] *= -1; // z轴反转
                objConfig.rotation[1] = -objConfig.rotation[1]; // y轴旋转
                break;
        }

        // 使用app.create创建新物体
        return app.create(objConfig);
    }

    // 创建对称房间
    createSymmetricRoom(targetDoor) {
        const sourceDoorPos = this.getRelativeDoorPosition(this.roomObj.door);
        const targetDoorPos = this.getRelativeDoorPosition(targetDoor);
        const symmetryType = Room.getSymmetryType(sourceDoorPos, targetDoorPos);
        
        if (!symmetryType) return null;

        // 创建新房间
        const newRoom = app.create({
            type: this.roomObj.type,
            position: [...this.roomObj.position.toArray()],
            style: this.roomObj.style
        });

        // 复制并变换房间内的物体
        this.roomObj.children.forEach(obj => {
            const transformedObj = this.transformObject(obj, symmetryType);
            newRoom.add(transformedObj);
        });

        return newRoom;
    }
}

// 工具函数
const RoomUtils = {
    // 检查两个房间是否可以进行对称操作
    checkRoomSymmetry(room1, room2) {
        const door1Pos = room1.door.position;
        const door2Pos = room2.door.position;
        const room1Pos = room1.position;
        const room2Pos = room2.position;
        
        // 计算相对门位置
        const relativePos1 = [
            door1Pos[0] - room1Pos[0], // x
            door1Pos[2] - room1Pos[2]  // z
        ];
        const relativePos2 = [
            door2Pos[0] - room2Pos[0], // x
            door2Pos[2] - room2Pos[2]  // z
        ];

        // 判断对称类型
        if (Math.abs(relativePos1[0] + relativePos2[0]) < 0.1) return 'x';
        if (Math.abs(relativePos1[1] + relativePos2[1]) < 0.1) return 'z';
        return null;
    },

    // 复制并对称房间内的物体
    mirrorRoomContent(sourceRoom, targetRoom, symmetryType) {
        sourceRoom.children.forEach(obj => {
            const objConfig = {
                type: obj.type,
                position: [...obj.position],
                rotation: [...obj.rotation],
                style: obj.style
            };
            
            // 根据对称类型调整位置和旋转
            if (symmetryType === 'x') {
                objConfig.position[0] *= -1;
                objConfig.rotation[1] = Math.PI - objConfig.rotation[1];
            } else if (symmetryType === 'z') {
                objConfig.position[2] *= -1;
                objConfig.rotation[1] = -objConfig.rotation[1];
            }
            
            const mirroredObj = app.create(objConfig);
            targetRoom.add(mirroredObj);
        });
    }
};

// 使用示例：
// const room1 = new Room(originalRoomObj);
// const symmetricRoom = room1.createSymmetricRoom(targetDoor);

// const symmetryType = RoomUtils.checkRoomSymmetry(room1, room2);
// if (symmetryType) {
//     RoomUtils.mirrorRoomContent(room1, room2, symmetryType);
// }