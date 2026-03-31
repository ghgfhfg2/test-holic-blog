# CRON_PROMPT_TEMPLATE.md

아래는 테스트홀릭 자동 게시용 프롬프트 템플릿이다.
크론 재등록/수정 시 이 구조를 사용한다.

---

다음 작업을 순서대로 수행해줘.

1. `/Users/sooya/.openclaw/workspace/test-holic-blog/VIRAL_TEST_GUIDELINES.md` 를 먼저 읽고 반드시 따른다.
2. `test-holic-blog`에 오늘자 신규 테스트 1개를 만든다.
3. 테스트는 **SNS 공유성이 높은 주제**를 우선 선택한다.
   - 연애/썸/플러팅
   - 친구들이 보는 나
   - 단톡방/카톡/DM/SNS 반응
   - 첫인상/분위기/숨겨진 매력
4. 제목은 설명형이 아니라 클릭 유도형으로 만든다.
5. 결과 4종의 이름은 무난한 상담형 표현보다, 공유하고 싶은 캐릭터형 이름으로 만든다.
6. 문항은 8개로 만들고, 최소 5개는 실제 상황형 문항으로 작성한다.
7. 선택지 순서는 문항마다 섞고, `1번=타입A / 2번=타입B / 3번=타입C / 4번=타입D` 고정 패턴을 금지한다.
8. 아래 파일들을 생성/수정한다.
   - `data/<test-id>.json`
   - `<test-id>/index.md`
   - `<test-id>/play.html`
   - `<test-id>/result/*.md`
9. 홈/전체 목록에 자동으로 잡히는지 확인한다.
10. 최종 점검 후 `/Users/sooya/.openclaw/workspace/test-holic-blog` 에서 git add -A && git commit && git push origin main 을 수행한다.
11. 결과로 아래를 요약 보고한다.
   - 테스트 제목
   - test id
   - 커밋 해시
   - URL 경로
   - 이번 테스트가 왜 바이럴형 주제인지 한 줄 설명
