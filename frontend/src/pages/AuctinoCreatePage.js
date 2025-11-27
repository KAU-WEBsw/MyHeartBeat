// frontend/src/pages/AuctionCreatePage.js
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import styles from "./AuctionCreatePage.module.css";

// ✅ 카테고리 ID → 이름 매핑
const CATEGORY_LABELS = {
  1: "명품 / 패션",
  2: "전자기기",
  3: "미술품 / 컬렉션",
  4: "취미 / 기타",
};

function AuctionCreatePage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    categoryId: "",
    description: "",
    startPrice: "",
    buyNowPrice: "",
    minBid: "",
    startDate: "",
    endDate: "",
  });

  const [previewImage, setPreviewImage] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreviewImage(url);
    // TODO: 나중에 실제 파일 업로드 구현
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:4000/api/auctions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: form.title,
          categoryId: form.categoryId ? Number(form.categoryId) : null,
          description: form.description,
          imageUrl: null, // TODO: 이미지 업로드 붙이면 실제 URL
          startPrice: Number(form.startPrice),
          minBidIncrement: Number(form.minBid),
          immediatePurchasePrice: form.buyNowPrice
            ? Number(form.buyNowPrice)
            : null,
          startTime: form.startDate,
          endTime: form.endDate,
          sellerId: 1, // TODO: 로그인한 사용자 id로 변경
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "경매 등록 실패");
        return;
      }

      alert("경매 등록 완료!");
      // 상세 페이지로 보내고 싶으면:
      // navigate(`/product/${data.auctionId}`);
      navigate("/main");
    } catch (error) {
      console.error(error);
      alert("서버 오류 발생");
    }
  };

  return (
    <div className={styles.pageRoot}>
      <Header />

      <main className={styles.main}>
        <div className={styles.pageHeader}>
          <h1>경매 등록</h1>
          <p>경매에 올릴 상품 정보를 자세히 입력해주세요.</p>
        </div>

        <form className={styles.layout} onSubmit={handleSubmit}>
          {/* 왼쪽 영역 */}
          <div className={styles.leftColumn}>
            {/* 기본 정보 */}
            <section className={styles.card}>
              <h2 className={styles.sectionTitle}>기본 정보</h2>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>
                  상품명 <span className={styles.required}>*</span>
                </label>
                <input
                  className={styles.input}
                  name="title"
                  placeholder="상품명을 입력하세요"
                  value={form.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>
                  카테고리 <span className={styles.required}>*</span>
                </label>
                <select
                  className={styles.select}
                  name="categoryId"
                  value={form.categoryId}
                  onChange={handleChange}
                  required
                >
                  <option value="">카테고리를 선택하세요</option>
                  <option value="1">명품 / 패션</option>
                  <option value="2">전자기기</option>
                  <option value="3">미술품 / 컬렉션</option>
                  <option value="4">취미 / 기타</option>
                </select>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>상세 설명</label>
                <textarea
                  className={styles.textarea}
                  name="description"
                  placeholder="상품에 대한 자세한 설명을 입력해주세요"
                  rows={4}
                  value={form.description}
                  onChange={handleChange}
                />
              </div>
            </section>

            {/* 상품 이미지 */}
            <section className={styles.card}>
              <h2 className={styles.sectionTitle}>상품 이미지</h2>

              <label className={styles.imageDropzone}>
                <div className={styles.imageDropContent}>
                  <div className={styles.imageIcon}>☁️</div>
                  <p className={styles.imageText}>
                    이미지를 드래그하거나 클릭해서 업로드
                  </p>
                  <p className={styles.imageSubText}>
                    최대 10MB, JPG / PNG 파일만 가능
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className={styles.imageInput}
                  onChange={handleImageChange}
                />
              </label>
            </section>

            {/* 경매 설정 */}
            <section className={styles.card}>
              <h2 className={styles.sectionTitle}>경매 설정</h2>

              <div className={styles.gridTwo}>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>
                    시작가 <span className={styles.required}>*</span>
                  </label>
                  <div className={styles.inputWithSuffix}>
                    <input
                      className={styles.input}
                      name="startPrice"
                      type="number"
                      min="0"
                      placeholder="0"
                      value={form.startPrice}
                      onChange={handleChange}
                      required
                    />
                    <span className={styles.suffix}>원</span>
                  </div>
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label}>즉시 구매가</label>
                  <div className={styles.inputWithSuffix}>
                    <input
                      className={styles.input}
                      name="buyNowPrice"
                      type="number"
                      min="0"
                      placeholder="입력하지 않으면 미설정"
                      value={form.buyNowPrice}
                      onChange={handleChange}
                    />
                    <span className={styles.suffix}>원</span>
                  </div>
                </div>
              </div>

              <div className={styles.gridTwo}>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>
                    최소 입찰 단위 <span className={styles.required}>*</span>
                  </label>
                  <div className={styles.inputWithSuffix}>
                    <input
                      className={styles.input}
                      name="minBid"
                      type="number"
                      min="0"
                      placeholder="예: 1000"
                      value={form.minBid}
                      onChange={handleChange}
                      required
                    />
                    <span className={styles.suffix}>원</span>
                  </div>
                </div>
              </div>

              <div className={styles.gridTwo}>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>
                    경매 시작 시간 <span className={styles.required}>*</span>
                  </label>
                  <input
                    className={styles.input}
                    type="datetime-local"
                    name="startDate"
                    value={form.startDate}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label}>
                    경매 종료 시간 <span className={styles.required}>*</span>
                  </label>
                  <input
                    className={styles.input}
                    type="datetime-local"
                    name="endDate"
                    value={form.endDate}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </section>
          </div>

          {/* 오른쪽 사이드 영역 */}
          <div className={styles.rightColumn}>
            {/* 미리보기 카드 */}
            <section className={styles.previewCard}>
              <h3 className={styles.previewTitle}>미리보기</h3>
              <div className={styles.previewImageBox}>
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt="preview"
                    className={styles.previewImage}
                  />
                ) : (
                  <span className={styles.previewPlaceholder}>
                    상품 이미지를 업로드하면 여기에서 미리보기로 보여요
                  </span>
                )}
              </div>
              <div className={styles.previewInfo}>
                <div className={styles.previewName}>
                  {form.title || "상품명 미입력"}
                </div>
                <div className={styles.previewMeta}>
                  {form.categoryId
                    ? `카테고리: ${
                        CATEGORY_LABELS[form.categoryId] || "알 수 없음"
                      }`
                    : "카테고리 미선택"}
                </div>
                <div className={styles.previewPrice}>
                  시작가{" "}
                  <strong>
                    {form.startPrice
                      ? `${Number(form.startPrice).toLocaleString()}원`
                      : "미설정"}
                  </strong>
                </div>
              </div>
            </section>

            {/* 안내 박스 + 버튼 */}
            <section className={styles.guideCard}>
              <h3>등록 전 확인사항</h3>
              <ul>
                <li>거래가 불가능한 상품이 아닌지 한 번 더 확인해주세요.</li>
                <li>허위 정보 기재 시 경매가 강제 종료될 수 있습니다.</li>
                <li>이미지에는 개인정보가 노출되지 않도록 주의해주세요.</li>
              </ul>

              <button type="submit" className={styles.submitButton}>
                경매 등록
              </button>
            </section>
          </div>
        </form>
      </main>
    </div>
  );
}

export default AuctionCreatePage;
