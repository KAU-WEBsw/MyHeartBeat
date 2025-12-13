// frontend/src/pages/AuctionCreatePage.js
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "../components/Header";
import styles from "./AuctionCreatePage.module.css";

// ✅ 카테고리 ID → 이름 매핑
const CATEGORY_LABELS = {
  1: "명품 / 패션",
  2: "전자기기",
  3: "미술품 / 컬렉션",
  4: "취미 / 기타",
};

const toDateTimeLocal = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (num) => String(num).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

function AuctionCreatePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");
  const isEditMode = useMemo(() => Boolean(editId), [editId]);

  const [form, setForm] = useState({
    title: "",
    categoryId: "",
    description: "",
    startPrice: "",
    buyNowPrice: "",
    endDate: "",
  });

  const [previewImage, setPreviewImage] = useState(null);

  // ✅ 수정: 실제 파일 객체 저장
  const [imageFile, setImageFile] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ 수정: 파일 업로드 처리
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file); // ⭐ 실제 파일 저장
    setPreviewImage(URL.createObjectURL(file)); // 미리보기용
  };

  useEffect(() => {
    if (!editId) return;

    const fetchAuction = async () => {
      try {
        const res = await fetch(`/api/auctions/${editId}`, {
          credentials: "include",
        });
        const data = await res.json();

        if (!res.ok) {
          alert(data.message || "경매 정보를 불러오지 못했습니다.");
          return;
        }

        setForm({
          title: data.title || "",
          categoryId: data.category_id ? String(data.category_id) : "",
          description: data.description || "",
          startPrice: data.start_price ?? "",
          buyNowPrice: data.immediate_purchase_price ?? "",
          endDate: toDateTimeLocal(data.end_time),
        });

        setPreviewImage(data.image_url || null);
        setImageFile(null); // ✅ 수정: 수정 모드에서는 새 파일 없으면 null
      } catch (error) {
        console.error(error);
        alert("경매 정보를 불러오지 못했습니다.");
      }
    };

    fetchAuction();
  }, [editId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const endTime = form.endDate
      ? form.endDate.replace("T", " ") + ":00"
      : null;

    try {
      const endpoint = isEditMode ? `/api/auctions/${editId}` : "/api/auctions";

      // ✅ 수정: FormData 사용
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append(
        "categoryId",
        form.categoryId ? Number(form.categoryId) : ""
      );
      formData.append("description", form.description);
      formData.append(
        "startPrice",
        form.startPrice !== "" ? Number(form.startPrice) : ""
      );
      formData.append(
        "immediatePurchasePrice",
        form.buyNowPrice ? Number(form.buyNowPrice) : ""
      );
      formData.append("endTime", endTime);

      // ✅ 수정: 파일이 있을 때만 추가
      if (imageFile) {
        formData.append("image", imageFile); // ⭐ 서버와 key 이름 맞추기
      }

      // ✅ 추가: 로컬스토리지에 저장된 로그인 정보가 있으면 sellerId를 함께 첨부

      try {
        const stored = localStorage.getItem("user");
        console.log("[debug] localStorage.user =", stored);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed?.id) formData.append("sellerId", parsed.id);
        }
      } catch (err) {
        console.error("parse user from localStorage failed", err);
      }

      // 디버그: 실제로 전송되는 FormData 항목들을 로그로 출력
      try {
        const entries = Array.from(formData.entries());
        console.log("[debug] formData entries:", entries);
      } catch (err) {
        console.warn("[debug] unable to read formData entries", err);
      }

      const res = await fetch(endpoint, {
        method: isEditMode ? "PUT" : "POST",
        body: formData, // ⭐ JSON 아님
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || `경매 ${isEditMode ? "수정" : "등록"} 실패`);
        return;
      }

      alert(`경매 ${isEditMode ? "수정" : "등록"} 완료!`);
      navigate(isEditMode ? `/product/${editId}` : "/auction/list");
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
          <h1>{isEditMode ? "경매 수정" : "경매 등록"}</h1>
          <p>
            {isEditMode
              ? "기존 등록 내용을 수정합니다."
              : "경매에 올릴 상품 정보를 자세히 입력해주세요."}
          </p>
        </div>

        <form className={styles.layout} onSubmit={handleSubmit}>
          {/* 왼쪽 영역 */}
          <div className={styles.leftColumn}>
            <section className={styles.card}>
              <h2 className={styles.sectionTitle}>기본 정보</h2>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>
                  상품명 <span className={styles.required}>*</span>
                </label>
                <input
                  className={styles.input}
                  name="title"
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
                  rows={4}
                  value={form.description}
                  onChange={handleChange}
                />
              </div>
            </section>

            {/* 이미지 업로드 */}
            <section className={styles.card}>
              <h2 className={styles.sectionTitle}>상품 이미지</h2>

              <label className={styles.imageDropzone}>
                <div className={styles.imageDropContent}>
                  <div className={styles.imageIcon}>☁️</div>
                  <p className={styles.imageText}>
                    이미지를 드래그하거나 클릭해서 업로드
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/jpg"
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
                  <label className={styles.label}>시작가 *</label>
                  <input
                    className={styles.input}
                    name="startPrice"
                    type="number"
                    value={form.startPrice}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label}>즉시 구매가</label>
                  <input
                    className={styles.input}
                    name="buyNowPrice"
                    type="number"
                    value={form.buyNowPrice}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>경매 종료 시간 *</label>
                <input
                  className={styles.input}
                  type="datetime-local"
                  name="endDate"
                  value={form.endDate}
                  onChange={handleChange}
                  required
                />
              </div>
            </section>
          </div>

          {/* 오른쪽 영역 */}
          <div className={styles.rightColumn}>
            <section className={styles.previewCard}>
              <h3>미리보기</h3>
              <div className={styles.previewImageBox}>
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt="preview"
                    className={styles.previewImage}
                  />
                ) : (
                  <span className={styles.previewPlaceholder}>
                    이미지를 업로드하면 미리보기가 표시됩니다
                  </span>
                )}
              </div>
            </section>

            <section className={styles.guideCard}>
              <button type="submit" className={styles.submitButton}>
                {isEditMode ? "경매 수정" : "경매 등록"}
              </button>
            </section>
          </div>
        </form>
      </main>
    </div>
  );
}

export default AuctionCreatePage;
