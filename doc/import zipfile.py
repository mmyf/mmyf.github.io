import zipfile
import os

def extract_text_from_zip(zip_path, output_dir='extracted_texts'):
    if not zipfile.is_zipfile(zip_path):
        print("该文件不是zip压缩包，无法自动恢复。")
        return

    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        os.makedirs(output_dir, exist_ok=True)
        for file in zip_ref.namelist():
            if file.endswith(('.txt', '.csv')):
                with zip_ref.open(file) as f:
                    content = f.read()
                    # 尝试多种编码
                    for encoding in ['utf-8', 'gbk', 'gb2312']:
                        try:
                            text = content.decode(encoding)
                            with open(os.path.join(output_dir, os.path.basename(file)), 'w', encoding='utf-8') as out_f:
                                out_f.write(text)
                            print(f"已恢复: {file}，编码: {encoding}")
                            break
                        except Exception:
                            continue
                    else:
                        print(f"无法解码: {file}")

if __name__ == "__main__":
    extract_text_from_zip('e:/VueProject/eat/mmyf.github.io/doc/1.txt')