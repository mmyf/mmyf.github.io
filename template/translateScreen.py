from mss import mss  # 使用 mss 库进行屏幕截图
import pytesseract
from translatepy.translators.google import GoogleTranslate  # 使用 GoogleTranslate
import cv2  # 使用 OpenCV 绘制文本

# 配置 Tesseract-OCR 的路径（需要安装 Tesseract-OCR）
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

def capture_screen():
    """截取屏幕并保存为临时图像"""
    with mss() as sct:
        screenshot = sct.shot(output="screenshot.png")
    return screenshot

def extract_text_with_boxes(image_path):
    """从图像中提取文字及其位置信息"""
    image = cv2.imread(image_path)
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    data = pytesseract.image_to_data(gray, output_type=pytesseract.Output.DICT)
    return data, image

def translate_text(text, target_language="zh-cn"):
    """将提取的文字翻译成目标语言"""
    translator = GoogleTranslate()  # 使用 GoogleTranslate
    if not text.strip():  # 如果文本为空，直接返回空字符串
        return ""
    translated = translator.translate(text, target_language)
    return translated.result

def draw_translations(image, data, target_language="zh-cn"):
    """在图像上绘制翻译后的文字"""
    for i in range(len(data['text'])):
        if data['text'][i].strip():  # 跳过空文本
            x, y, w, h = data['left'][i], data['top'][i], data['width'][i], data['height'][i]
            original_text = data['text'][i]
            translated_text = translate_text(original_text, target_language)
            # 在图像上绘制翻译后的文字
            cv2.rectangle(image, (x, y), (x + w, y + h), (0, 255, 0), 2)  # 绘制矩形框
            cv2.putText(image, translated_text, (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 1)
    return image

if __name__ == "__main__":
    print("正在截取屏幕...")
    image_path = capture_screen()
    
    print("正在提取文字及位置信息...")
    data, image = extract_text_with_boxes(image_path)
    
    print("正在翻译文字并绘制到图像上...")
    translated_image = draw_translations(image, data)
    
    output_path = "translated_screenshot.png"
    cv2.imwrite(output_path, translated_image)
    print(f"翻译后的图像已保存到 {output_path}")