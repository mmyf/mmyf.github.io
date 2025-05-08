import pandas as pd

# 读取txt文件
df = pd.read_csv('items.txt', sep=';', encoding='utf-8', quotechar='"')

# 构建超链接
base_url = 'https://delta.world-of-dungeons.org/wod/spiel/hero/item.php?name='
df['Name'] = df['Name'].apply(lambda x: f'=HYPERLINK("{base_url}{x}","{x}")')

# 保存为Excel文件
with pd.ExcelWriter('宝库内容20250508.xlsx', engine='openpyxl') as writer:
    df.to_excel(writer, index=False)

    # 获取工作表
    worksheet = writer.sheets['Sheet1']

    # 设置列宽
    worksheet.column_dimensions['A'].width = 30  # Name列
    worksheet.column_dimensions['D'].width = 10  # Hitpoints列
    worksheet.column_dimensions['F'].width = 40  # Itemclasses列
    worksheet.column_dimensions['G'].width = 15  # Unique-Type列

print("Excel文件已生成完成！")
