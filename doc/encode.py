import chardet

def auto_decode_file(file_path):
    with open(file_path, 'rb') as f:
        data = f.read()
    result = chardet.detect(data)
    encoding = result['encoding']
    print(f"检测到的编码: {encoding}")
    try:
        text = data.decode(encoding)
        # 只保留常见汉字和标点
        import re
        chinese = re.findall(r'[\u4e00-\u9fa5，。！？、；：“”‘’（）《》【】]', text)
        print('恢复内容（前1000字）：')
        print(''.join(chinese)[:1000])
    except Exception as e:
        print(f"自动检测编码解码失败: {e}")

if __name__ == '__main__':
    auto_decode_file('e:/VueProject/eat/mmyf.github.io/doc/1.txt')