import json
import pandas as pd
from pathlib import Path

def json_to_excel(json_file: str, excel_file: str = None):
    """
    将JSON文件转换为Excel文件
    :param json_file: JSON文件路径
    :param excel_file: 输出的Excel文件路径，如果未指定则使用同名xlsx文件
    """
    try:
        # 读取JSON文件
        with open(json_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # 将数据转换为DataFrame
        df = pd.DataFrame(data)
        
        # 如果未指定excel文件名，则使用json文件同名
        if not excel_file:
            excel_file = Path(json_file).with_suffix('.xlsx')
            
        # 保存为Excel文件
        df.to_excel(excel_file, index=False)
        print(f"转换成功！Excel文件已保存为：{excel_file}")
        
    except Exception as e:
        print(f"转换失败: {str(e)}")

if __name__ == "__main__":
    # 默认转换之前导出的ward数据文件
    json_to_excel('ct_ward.json')
