# N00 배포

원래 서비스 폴더 자체가 배포 저장소입니다. 로컬 변경을 commit하고 GitHub에 push하면 같은 Pages 주소로 자동 배포됩니다. 파일 저장만으로는 공개 사이트가 바뀌지 않습니다.

## 처음 한 번

1. GitHub Desktop → File → Add Local Repository. 이 문서가 있는 n00 폴더를 선택합니다.
2. Publish repository. 저장소 이름은 n00-exhibition 등을 사용할 수 있습니다. GitHub Free의 Pages는 공개 저장소에서 사용할 수 있으므로 공개할 코드와 에셋을 확인하세요.
3. GitHub 저장소 → Settings → Pages → Build and deployment → Source를 GitHub Actions로 설정합니다.
4. Actions → Publish N00 website → Run workflow. 이후 main에 push할 때 자동으로 실행됩니다.
5. 완료된 Pages 배포의 URL이 공유할 주소입니다.

## 수정 반영

이 n00 폴더 파일 수정 → GitHub Desktop에서 Commit to main → Push origin. Actions가 통과하면 같은 주소가 갱신됩니다.

## 범위

영상과 이미지가 포함됩니다. Claude outputs, 도록·보고서·백업은 Git 및 공개 산출물에서 제외합니다. 사용자 참여 데이터는 각 브라우저에만 저장되며 서버로 동기화하지 않습니다. 이미지 생성 API는 아직 연결 전입니다. 저장소 공개 시 브라우저용 소스와 에셋은 내려받을 수 있습니다.

GitHub 공식 안내: https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
