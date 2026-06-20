## 🚀 [앱 실행하기](https://lgw7126.github.io/antigravity-DangsPatch-app/)

# 🐾 댕스패치 (Dang-spatch) — 유기견 구조 헬퍼

> **🔗 실행 링크**: [https://lgw7126.github.io/antigravity-DangsPatch-app](https://lgw7126.github.io/antigravity-DangsPatch-app)

---

## 📋 기획 개요

유기견을 발견했을 때 당황하지 않고, 현재 위치 기반으로 가장 가까운 동물 보호소에 빠르게 연락하고 당근마켓 동네생활에 도움 요청 글을 올릴 수 있도록 돕는 모바일 최적화 웹앱.

---

## ✨ 주요 기능

- **현재 위치 파악** — 브라우저 Geolocation API로 위경도 획득 후 도로명 주소 자동 변환 (카카오맵 API)
- **주변 보호소 3곳 탐색** — 공공데이터포털 동물보호센터 API 연동, 거리순 정렬
- **전화 연결** — `tel:` 링크로 보호소에 원터치 전화
- **당근마켓 3초 컷** — 신고 텍스트 자동 생성 → 클립보드 복사 → 당근마켓 딥링크(`daangn://`) 실행
---

## 🛠️ 기술 스택

- **Framework**: React (Vite)
- **Language**: JavaScript
- **Styling**: Tailwind CSS

---

## 🚀 사용 방법

1. 앱을 열면 자동으로 현재 위치를 파악합니다
2. 가까운 보호소 목록에서 **[전화하기]** 버튼으로 즉시 연락
3. 하단의 **[내용 복사하고 당근마켓 열기]** 버튼으로 제보글 자동 작성

## 💻 제보글 자동

```bash
npm install
npm run dev
```
