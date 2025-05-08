import json
import pymysql
import pandas as pd
from datetime import datetime

# 数据库连接配置（建议从环境变量或安全配置中获取敏感信息）
DB_CONFIG = {
    'host': 'xx',
    'user': 'xx',
    'password': 'xx',
    'db': 'xx',
    'charset': 'utf8mb4',
    'cursorclass': pymysql.cursors.DictCursor
}

# 需要导出的字段列表（按需修改）
TARGET_FIELDS = ['t1.id', 't1.hospital_id', 't1.hospital_area_id', 't2.floor_object_id', 't2.floor_num', 't3.name as hospital_name', 't4.name as hospital_area_name']

# 导出设置
TABLE_NAME = 'ct_ward t1'  # 修改为你的表名
OUTPUT_FILE = 'ct_ward.xlsx'  # 修改为xlsx格式


def datetime_handler(obj):
    """处理datetime对象序列化问题"""
    if isinstance(obj, datetime):
        return obj.isoformat()
    raise TypeError("Type %s not serializable" % type(obj))


def export_to_json():

    try:
        # 连接数据库
        connection = pymysql.connect(**DB_CONFIG)

        with connection.cursor() as cursor:
            # 构建查询语句
            sql = f"""SELECT {','.join(TARGET_FIELDS)} FROM {TABLE_NAME} 
            LEFT JOIN md_floor t2 ON t1.floor_id = t2.id 
            LEFT JOIN ct_org_hospital t3 ON t3.id = t1.hospital_id 
            LEFT JOIN ct_org_hospital_area t4 ON t4.id = t1.hospital_area_id 
            """
            cursor.execute(sql)

            # 处理结果
            result = cursor.fetchall()
            
            # 转换为DataFrame并导出到Excel
            df = pd.DataFrame(result)
            df.to_excel(OUTPUT_FILE, index=False)

            print(f"成功导出 {len(result)} 条数据到 {OUTPUT_FILE}")
            connection.close()

    except Exception as e:
        print(f"导出失败: {str(e)}")
    finally:
        pass


if __name__ == "__main__":
    export_to_json()