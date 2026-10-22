
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Package,
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  Boxes,
  AlertTriangle,
  Tags,
  Store,
  UserRound,
  LayoutGrid,
  List,
  X,
  Upload,
  Image as ImageIcon,
  Sparkles,
  IndianRupee,
  ChevronDown,
  RefreshCw,
} from "lucide-react";
import Swal from "sweetalert2";
import AdminNavbar from "../../components/AdminNavbar";
import fetchProducts, {
  createProduct,
  deleteProduct,
  updateProduct,
} from "../../services/productService";
import fetchShops from "../../services/shopService";

const emptyForm = {
  productName: "",
  price: "",
  description: "",
  category: "",
  shop: "",
  stock: "",
  image: "",
};

function normalizeProduct(product) {
  const shop =
    product.productShop && typeof product.productShop === "object"
      ? product.productShop
      : null;
  const owner =
    product.productOwner && typeof product.productOwner === "object"
      ? product.productOwner
      : null;
// get the shop name and owner name from the product object, if they exist, otherwise use empty strings
  return {
    _id: product._id,
    productName: product.productName || "",
    price: product.productPrice,
    description: product.productDescription || "",
    category: product.productCategory || "",
    shop: shop?.shopName || "",
    shopId:
      shop?._id ||
      (typeof product.productShop === "string" ? product.productShop : ""),
    owner: owner?.name || owner?.email || "",
    stock: Number(product.productStock) || 0,
    image: product.ProductImage || "",
  };
}
// convert the form data to the format expected by the API
function toApiProduct(formData) {
  return {
    productName: formData.productName.trim(),
    productPrice: Number(formData.price),
    productDescription: formData.description.trim(),
    ProductImage: formData.image.trim(),
    productCategory: formData.category.trim(),
    productShop: formData.shop || null,
    productStock: Number(formData.stock),
  };
}

const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

const stockStatus = (stock) => {
  if (Number(stock) === 0) return "Out of Stock";
  if (Number(stock) <= 5) return "Low Stock";
  return "In Stock";
};

function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [shopsError, setShopsError] = useState("");
  const [shopsLoading, setShopsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState("All Categories");
  const [viewMode, setViewMode] = useState("table");

  const [modalType, setModalType] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [imagePreview, setImagePreview] = useState("");

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const productList = await fetchProducts();
      setProducts(productList.map(normalizeProduct));
    } catch (loadError) {
      console.error("Failed to load products:", loadError);
      setError(loadError.message || "Unable to load products.");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadShops = useCallback(async () => {
    setShopsLoading(true);
    setShopsError("");

    try {
      const shopList = await fetchShops();
      setShops(shopList);
    } catch (loadError) {
      console.error("Failed to load shops:", loadError);
      setShopsError(loadError.message || "Unable to load shops.");
    } finally {
      setShopsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    loadShops();
  }, [loadShops]);

  const totalProducts = products.length;

  const inStockProducts = products.filter(
    (product) => Number(product.stock) > 5
  ).length;

  const lowStockProducts = products.filter(
    (product) => Number(product.stock) > 0 && Number(product.stock) <= 5
  ).length;

  const outOfStockProducts = products.filter(
    (product) => Number(product.stock) === 0
  ).length;
  const categories = [
    ...new Set(
      products
        .map((product) => product.category)
        .filter((category) => typeof category === "string" && category.trim())
    ),
  ];

  const filteredProducts = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch = [
        product.productName,
        product.description,
        product.category,
        product.shop,
        product.owner,
      ].some((value) =>
        String(value || "").toLowerCase().includes(query)
      );

      const matchesCategory =
        selectedCategory === "All Categories" ||
        product.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  const closeModal = () => {
    setModalType("");
    setSelectedProduct(null);
    setFormData(emptyForm);
    setImagePreview("");
  };

  const openCreateModal = () => {
    setFormData(emptyForm);
    setSelectedProduct(null);
    setImagePreview("");
    setModalType("create");
  };

  const openEditModal = (product) => {
    setSelectedProduct(product);
    setFormData({
      productName: product.productName || "",
      price: String(product.price ?? ""),
      description: product.description || "",
      category: product.category || "",
      shop: product.shopId || "",
      stock: String(product.stock ?? ""),
      image: product.image || "",
    });
    setImagePreview(product.image || "");
    setModalType("edit");
  };

  const openViewModal = (product) => {
    setSelectedProduct(product);
    setModalType("view");
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (name === "image") {
      setImagePreview(value);
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      Swal.fire({
        icon: "error",
        title: "Invalid image",
        text: "Please select an image file.",
        confirmButtonColor: "#ec4899",
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      Swal.fire({
        icon: "warning",
        title: "Image too large",
        text: "Choose an image smaller than 2 MB.",
        confirmButtonColor: "#ec4899",
      });
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const image = String(reader.result || "");
      setImagePreview(image);
      setFormData((previous) => ({
        ...previous,
        image,
      }));
    };
    reader.onerror = () => {
      Swal.fire({
        icon: "error",
        title: "Unable to read image",
        text: "Please choose another image file.",
        confirmButtonColor: "#ec4899",
      });
    };

    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const price = Number(formData.price);
    const stock = Number(formData.stock);

    if (
      !formData.productName.trim() ||
      !formData.category.trim() ||
      formData.price === "" ||
      formData.stock === "" ||
      !Number.isFinite(price) ||
      price < 0 ||
      !Number.isInteger(stock) ||
      stock < 0
    ) {
      Swal.fire({
        icon: "warning",
        title: "Check product details",
        text: "Enter a product name, category, valid price and whole-number stock quantity.",
        confirmButtonColor: "#ec4899",
      });
      return;
    }

    const productData = toApiProduct({
      ...formData,
      productName: formData.productName.trim(),
      description: formData.description.trim(),
      category: formData.category.trim(),
      price,
      stock,
    });

    setSaving(true);
    try {
      if (modalType === "edit" && selectedProduct) {
        await updateProduct(selectedProduct._id, productData);
      } else {
        await createProduct(productData);
      }

      closeModal();
      await loadProducts();

      await Swal.fire({
        icon: "success",
        title:
          modalType === "edit" ? "Product updated!" : "Product created!",
        text:
          modalType === "edit"
            ? "Product updated successfully."
            : "Product added successfully.",
        confirmButtonColor: "#ec4899",
      });
    } catch (saveError) {
      console.error("Failed to save product:", saveError);
      await Swal.fire({
        icon: "error",
        title: "Unable to save product",
        text: saveError.message || "Please try again.",
        confirmButtonColor: "#ec4899",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (product) => {
    const result = await Swal.fire({
      title: "Delete product?",
      text: `Are you sure you want to delete "${product.productName}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#ec4899",
      cancelButtonColor: "#64748b",
      reverseButtons: true,
      focusCancel: true,
    });

    if (!result.isConfirmed) return;

    setDeletingId(product._id);
    try {
      await deleteProduct(product._id);
      if (selectedProduct?._id === product._id) closeModal();
      await loadProducts();

      await Swal.fire({
        icon: "success",
        title: "Product deleted",
        text: "Product removed successfully.",
        confirmButtonColor: "#ec4899",
      });
    } catch (deleteError) {
      console.error("Failed to delete product:", deleteError);
      await Swal.fire({
        icon: "error",
        title: "Unable to delete product",
        text: deleteError.message || "Please try again.",
        confirmButtonColor: "#ec4899",
      });
    } finally {
      setDeletingId("");
    }
  };

  const stats = [
    {
      title: "Total Products",
      value: totalProducts,
      icon: Package,
      iconClass: "bg-pink-100 text-pink-600",
      gradient: "from-pink-500 to-rose-400",
    },
    {
      title: "In Stock",
      value: inStockProducts,
      icon: Boxes,
      iconClass: "bg-sky-100 text-sky-600",
      gradient: "from-sky-500 to-blue-500",
    },
    {
      title: "Low Stock",
      value: lowStockProducts,
      icon: AlertTriangle,
      iconClass: "bg-amber-100 text-amber-600",
      gradient: "from-amber-400 to-orange-500",
    },
    {
      title: "Out of Stock",
      value: outOfStockProducts,
      icon: Tags,
      iconClass: "bg-violet-100 text-violet-600",
      gradient: "from-violet-500 to-purple-500",
    },
  ];

  const ProductImage = ({ product, className }) =>
    product.image ? (
      <img
        src={product.image}
        alt={product.productName}
        className={className}
        onError={(event) => {
          event.currentTarget.style.visibility = "hidden";
        }}
      />
    ) : (
      <div
        className={`${className} grid place-items-center bg-gradient-to-br from-pink-50 to-sky-50 text-sky-400`}
      >
        <ImageIcon size={34} />
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-pink-50 text-slate-800">
      <AdminNavbar />

      <main className="mx-auto min-w-0 max-w-[1600px] space-y-7 px-4 pb-7 pt-24 sm:px-6 lg:ml-[270px] lg:mr-0 lg:w-[calc(100%-270px)] lg:px-9 lg:pt-7">
        {/* Heading */}
        <section className="flex animate-[fadeUp_.5s_ease-out] flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-pink-100 bg-white px-3 py-1.5 text-xs font-bold text-pink-600 shadow-sm">
              <Sparkles size={15} />
              GIFT SHOP HUB · ADMIN
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Product{" "}
              <span className="bg-gradient-to-r from-pink-500 to-sky-500 bg-clip-text text-transparent">
                Management
              </span>
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Manage products, shops, pricing and inventory.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-sky-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-pink-200/60 transition duration-300 hover:-translate-y-1 hover:shadow-xl active:scale-95"
          >
            <Plus size={19} />
            Add Product
          </button>
        </section>

        {/* Statistics */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;

            return (
              <article
                key={stat.title}
                style={{ animationDelay: `${index * 100}ms` }}
                className="group animate-[fadeUp_.5s_ease-out_both] rounded-2xl border border-white bg-white/90 p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-sky-200 hover:shadow-xl hover:shadow-sky-100/70"
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`rounded-xl p-3 transition duration-300 group-hover:scale-110 ${stat.iconClass}`}
                  >
                    <Icon size={24} />
                  </div>

                  <div
                    className={`h-1.5 w-16 rounded-full bg-gradient-to-r ${stat.gradient}`}
                  />
                </div>

                <p className="mt-5 text-sm font-medium text-slate-500">
                  {stat.title}
                </p>

                <h2 className="mt-1 text-3xl font-extrabold text-slate-900">
                  {loading ? "..." : error ? "—" : stat.value}
                </h2>
              </article>
            );
          })}
        </section>

        {/* Search, category filter and view controls */}
        <section className="flex flex-col gap-3 rounded-2xl border border-sky-100 bg-white/90 p-4 shadow-sm md:flex-row md:items-center">
          <div className="relative min-w-0 flex-1">
            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-sky-500"
            />

            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search products, shops or owners..."
              aria-label="Search products"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
            />
          </div>

          <div className="relative">
            <Tags
              size={17}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-pink-500"
            />
            <select
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
              aria-label="Filter by category"
              className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-3 pl-9 pr-9 text-sm outline-none transition focus:border-pink-400 focus:ring-4 focus:ring-pink-100 md:w-52"
            >
              <option>All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
          </div>

          <div className="flex gap-1 self-end rounded-xl bg-slate-100 p-1 md:self-auto">
            <button
              type="button"
              onClick={() => setViewMode("table")}
              aria-label="Table view"
              className={`rounded-lg p-2.5 transition ${
                viewMode === "table"
                  ? "bg-white text-sky-600 shadow-sm"
                  : "text-slate-500 hover:text-pink-500"
              }`}
            >
              <List size={19} />
            </button>

            <button
              type="button"
              onClick={() => setViewMode("grid")}
              aria-label="Grid view"
              className={`rounded-lg p-2.5 transition ${
                viewMode === "grid"
                  ? "bg-white text-pink-600 shadow-sm"
                  : "text-slate-500 hover:text-sky-500"
              }`}
            >
              <LayoutGrid size={19} />
            </button>
          </div>
        </section>

        {shopsError && (
          <div
            role="status"
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
          >
            <span>Shop options could not be loaded: {shopsError}</span>
            <button
              type="button"
              onClick={loadShops}
              className="inline-flex items-center gap-2 font-semibold hover:text-amber-900"
            >
              <RefreshCw size={15} />
              Retry
            </button>
          </div>
        )}

        {/* Product listing */}
        <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-extrabold text-slate-800">
                All Products
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Showing {filteredProducts.length} of {products.length} products
              </p>
            </div>

            <span className="w-fit rounded-full bg-sky-50 px-3 py-1.5 text-xs font-bold text-sky-700">
              {filteredProducts.length} results
            </span>
          </div>

          {loading ? (
            <div aria-live="polite" className="px-5 py-16 text-center">
              <RefreshCw size={28} className="mx-auto animate-spin text-sky-500" />
              <p className="mt-4 font-semibold text-slate-600">
                Loading products...
              </p>
            </div>
          ) : error ? (
            <div role="alert" className="px-5 py-12 text-center">
              <p className="font-semibold text-rose-600">{error}</p>
              <button
                type="button"
                onClick={loadProducts}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-sky-500 px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5"
              >
                <RefreshCw size={16} />
                Try again
              </button>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center px-5 py-16 text-center">
              <div className="rounded-2xl bg-sky-50 p-5 text-sky-500">
                <Package size={38} />
              </div>
              <h3 className="mt-4 text-lg font-bold text-slate-800">
                No products found
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                Change your search or category, or create a product.
              </p>
              <button
                type="button"
                onClick={openCreateModal}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-sky-500 px-5 py-3 text-sm font-bold text-white transition hover:scale-105"
              >
                <Plus size={18} />
                Create Product
              </button>
            </div>
          ) : viewMode === "table" ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] text-left">
                <thead className="bg-slate-50/90 text-xs uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-5 py-4">Product</th>
                    <th className="px-5 py-4">Category</th>
                    <th className="px-5 py-4">Price</th>
                    <th className="px-5 py-4">Shop & Owner</th>
                    <th className="px-5 py-4">Stock</th>
                    <th className="px-5 py-4">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.map((product) => (
                    <tr
                      key={product._id}
                      className="transition-colors hover:bg-sky-50/40"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <ProductImage
                            product={product}
                            className="h-14 w-14 shrink-0 rounded-xl object-cover"
                          />
                          <div className="max-w-64">
                            <p className="font-bold text-slate-800">
                              {product.productName}
                            </p>
                            <p className="mt-1 line-clamp-1 text-xs text-slate-500">
                              {product.description}
                            </p>
                            <p className="mt-1 text-[11px] text-slate-400">
                              ID: {product._id}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="inline-flex rounded-full bg-pink-50 px-3 py-1.5 text-xs font-bold text-pink-600">
                          {product.category}
                        </span>
                      </td>

                      <td className="px-5 py-4 font-extrabold text-slate-800">
                        {money(product.price)}
                      </td>

                      <td className="px-5 py-4">
                        <div className="space-y-2">
                          <p className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                            <Store size={15} className="text-sky-500" />
                            {product.shop || "Not assigned"}
                          </p>
                          <p className="flex items-center gap-2 text-xs text-slate-500">
                            <UserRound size={15} className="text-pink-500" />
                            {product.owner || "Not assigned"}
                          </p>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex flex-col items-start gap-2">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                              product.stock === 0
                                ? "bg-rose-50 text-rose-600"
                                : product.stock <= 5
                                  ? "bg-amber-50 text-amber-700"
                                  : "bg-emerald-50 text-emerald-700"
                            }`}
                          >
                            {stockStatus(product.stock)}
                          </span>
                          <span className="text-xs text-slate-500">
                            {product.stock} units
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            title="View product"
                            aria-label={`View ${product.productName}`}
                            onClick={() => openViewModal(product)}
                            className="rounded-lg bg-sky-50 p-2.5 text-sky-600 transition hover:scale-110 hover:bg-sky-100"
                          >
                            <Eye size={17} />
                          </button>

                          <button
                            type="button"
                            title="Edit product"
                            aria-label={`Edit ${product.productName}`}
                            disabled={Boolean(deletingId) || saving}
                            onClick={() => openEditModal(product)}
                            className="rounded-lg bg-pink-50 p-2.5 text-pink-600 transition hover:scale-110 hover:bg-pink-100 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Pencil size={17} />
                          </button>

                          <button
                            type="button"
                            title="Delete product"
                            aria-label={`Delete ${product.productName}`}
                            disabled={deletingId === product._id || saving}
                            onClick={() => handleDelete(product)}
                            className="rounded-lg bg-rose-50 p-2.5 text-rose-600 transition hover:scale-110 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {filteredProducts.map((product, index) => (
                <article
                  key={product._id}
                  style={{ animationDelay: `${index * 60}ms` }}
                  className="group animate-[fadeUp_.4s_ease-out_both] overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1.5 hover:border-pink-200 hover:shadow-xl hover:shadow-pink-100/50"
                >
                  <div className="relative overflow-hidden">
                    <ProductImage
                      product={product}
                      className="h-48 w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-pink-600 shadow-sm">
                      {product.category}
                    </span>
                    <span
                      className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-bold ${
                        product.stock === 0
                          ? "bg-rose-50 text-rose-600"
                          : product.stock <= 5
                            ? "bg-amber-50 text-amber-700"
                            : "bg-emerald-50 text-emerald-700"
                      }`}
                    >
                      {stockStatus(product.stock)}
                    </span>
                  </div>

                  <div className="p-5">
                    <h3 className="text-lg font-bold text-slate-800 transition group-hover:text-pink-600">
                      {product.productName}
                    </h3>

                    <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-slate-500">
                      {product.description}
                    </p>

                    <p className="mt-4 bg-gradient-to-r from-pink-600 to-sky-600 bg-clip-text text-xl font-extrabold text-transparent">
                      {money(product.price)}
                    </p>

                    <div className="mt-4 space-y-2 border-b border-slate-100 pb-4">
                      <p className="flex items-center gap-2 text-sm text-slate-500">
                        <Store size={15} className="text-sky-500" />
                        {product.shop || "Not assigned"}
                      </p>
                      <p className="flex items-center gap-2 text-sm text-slate-500">
                        <UserRound size={15} className="text-pink-500" />
                        {product.owner || "Not assigned"}
                      </p>
                      <p className="flex items-center gap-2 text-sm text-slate-500">
                        <Boxes size={15} className="text-sky-500" />
                        {product.stock} units
                      </p>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <button
                        type="button"
                        onClick={() => openViewModal(product)}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-sky-50 py-2.5 text-xs font-bold text-sky-700 transition hover:bg-sky-100"
                      >
                        <Eye size={15} /> View
                      </button>
                      <button
                        type="button"
                        disabled={Boolean(deletingId) || saving}
                        onClick={() => openEditModal(product)}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-pink-50 py-2.5 text-xs font-bold text-pink-700 transition hover:bg-pink-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Pencil size={15} /> Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(product)}
                        aria-label={`Delete ${product.productName}`}
                        disabled={deletingId === product._id || saving}
                        className="rounded-lg bg-rose-50 p-2.5 text-rose-600 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <footer className="flex flex-col justify-between gap-2 pb-4 text-xs text-slate-400 sm:flex-row">
          <span>Gift Shop Hub · Product Management</span>
          <span>{products.length} products</span>
        </footer>
      </main>

      {/* Create / Edit Modal */}
      {(modalType === "create" || modalType === "edit") && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="product-form-title"
            className="my-auto w-full max-w-2xl animate-[fadeUp_.25s_ease-out] overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-start justify-between border-b border-slate-100 bg-gradient-to-r from-pink-50 to-sky-50 p-5 sm:p-6">
              <div>
                <span className="text-xs font-extrabold tracking-widest text-pink-600">
                  PRODUCT CATALOGUE
                </span>
                <h2
                  id="product-form-title"
                  className="mt-2 text-xl font-extrabold text-slate-900"
                >
                  {modalType === "create" ? "Create Product" : "Edit Product"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Enter the product details below.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                aria-label="Close modal"
                className="rounded-xl bg-white p-2 text-slate-500 shadow-sm transition hover:bg-pink-50 hover:text-pink-600"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-6">
              <div className="flex flex-col gap-4 rounded-xl border border-dashed border-sky-200 bg-sky-50/50 p-4 sm:flex-row sm:items-center">
                <div className="grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-xl bg-white text-sky-500 shadow-sm">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Product preview"
                      className="h-full w-full object-cover"
                      onError={() => setImagePreview("")}
                    />
                  ) : (
                    <ImageIcon size={30} />
                  )}
                </div>

                <div className="min-w-0">
                  <p className="font-bold text-slate-800">Product image</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Upload an image or enter an image URL below.
                  </p>
                  <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-sky-200 bg-white px-3 py-2 text-xs font-bold text-sky-700 transition hover:bg-sky-50">
                    <Upload size={15} />
                    Upload image
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </label>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label
                    htmlFor="productName"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Product Name *
                  </label>
                  <input
                    id="productName"
                    name="productName"
                    value={formData.productName}
                    onChange={handleChange}
                    placeholder="Enter product name"
                    maxLength={100}
                    required
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-pink-400 focus:ring-4 focus:ring-pink-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="price"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Price (₹) *
                  </label>
                  <div className="relative">
                    <IndianRupee
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-sky-500"
                    />
                    <input
                      id="price"
                      name="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={handleChange}
                      placeholder="799"
                      required
                      className="w-full rounded-xl border border-slate-200 py-3 pl-9 pr-3 text-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="stock"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Stock Quantity *
                  </label>
                  <input
                    id="stock"
                    name="stock"
                    type="number"
                    min="0"
                    step="1"
                    value={formData.stock}
                    onChange={handleChange}
                    placeholder="25"
                    required
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="category"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Category *
                  </label>
                  <input
                    id="category"
                    name="category"
                    type="text"
                    value={formData.category}
                    onChange={handleChange}
                    placeholder="Enter product category"
                    maxLength={100}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-pink-400 focus:ring-4 focus:ring-pink-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="shop"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Shop Name
                  </label>
                  <select
                    id="shop"
                    name="shop"
                    value={formData.shop}
                    onChange={handleChange}
                    disabled={shopsLoading}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                  >
                    <option value="">No shop assigned</option>
                    {modalType === "edit" &&
                      formData.shop &&
                      !shops.some((shop) => shop._id === formData.shop) && (
                        <option value={formData.shop}>
                          {selectedProduct?.shop || "Current shop"}
                        </option>
                      )}
                    {shops.map((shop) => (
                      <option key={shop._id} value={shop._id}>
                        {shop.shopName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="rounded-xl border border-pink-100 bg-pink-50/60 p-4 text-sm text-slate-600">
                  <UserRound size={17} className="mb-2 text-pink-500" />
                  Product owner is assigned from the authenticated account.
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="image"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Image URL
                  </label>
                  <input
                    id="image"
                    name="image"
                    type="text"
                    value={formData.image}
                    onChange={handleChange}
                    placeholder="https://example.com/product.jpg"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="description"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    maxLength={1000}
                    placeholder="Describe your product..."
                    className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-pink-400 focus:ring-4 focus:ring-pink-100"
                  />
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-sky-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-pink-100 transition hover:-translate-y-0.5 hover:shadow-xl"
                >
                  {saving ? (
                    <RefreshCw size={18} className="animate-spin" />
                  ) : modalType === "create" ? (
                    <Plus size={18} />
                  ) : (
                    <Pencil size={17} />
                  )}
                  {saving
                    ? "Saving..."
                    : modalType === "create"
                      ? "Create Product"
                      : "Save Changes"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {/* View product modal */}
      {modalType === "view" && selectedProduct && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="product-detail-title"
            className="my-auto w-full max-w-xl animate-[fadeUp_.25s_ease-out] overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between bg-gradient-to-r from-pink-50 to-sky-50 p-5">
              <div>
                <p className="text-xs font-extrabold tracking-widest text-pink-600">
                  PRODUCT DETAILS
                </p>
                <h2 className="mt-1 text-xl font-extrabold text-slate-900">
                  View Product
                </h2>
              </div>
              <button
                type="button"
                onClick={closeModal}
                aria-label="Close modal"
                className="rounded-xl bg-white p-2 text-slate-500 shadow-sm transition hover:text-pink-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-5 sm:p-6">
              <ProductImage
                product={selectedProduct}
                className="h-56 w-full rounded-xl object-cover"
              />

              <div className="mt-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                <div>
                  <span className="rounded-full bg-pink-50 px-3 py-1 text-xs font-bold text-pink-600">
                    {selectedProduct.category}
                  </span>
                  <h3
                    id="product-detail-title"
                    className="mt-3 text-2xl font-extrabold text-slate-900"
                  >
                    {selectedProduct.productName}
                  </h3>
                  <p className="mt-1 text-xs text-slate-400">
                    Product ID: {selectedProduct._id}
                  </p>
                </div>
                <strong className="text-xl font-extrabold text-sky-600">
                  {money(selectedProduct.price)}
                </strong>
              </div>

              <p className="mt-4 text-sm leading-6 text-slate-500">
                {selectedProduct.description || "No description provided."}
              </p>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-sky-50 p-4">
                  <Store size={18} className="text-sky-600" />
                  <p className="mt-2 text-xs text-slate-500">Shop</p>
                  <p className="mt-1 break-words text-sm font-bold text-slate-800">
                    {selectedProduct.shop || "Not assigned"}
                  </p>
                </div>

                <div className="rounded-xl bg-pink-50 p-4">
                  <UserRound size={18} className="text-pink-600" />
                  <p className="mt-2 text-xs text-slate-500">Owner</p>
                  <p className="mt-1 break-words text-sm font-bold text-slate-800">
                    {selectedProduct.owner || "Not assigned"}
                  </p>
                </div>

                <div className="rounded-xl bg-sky-50 p-4">
                  <Boxes size={18} className="text-sky-600" />
                  <p className="mt-2 text-xs text-slate-500">Stock</p>
                  <p className="mt-1 text-sm font-bold text-slate-800">
                    {selectedProduct.stock} units
                  </p>
                </div>

                <div className="rounded-xl bg-pink-50 p-4">
                  <Tags size={18} className="text-pink-600" />
                  <p className="mt-2 text-xs text-slate-500">Stock Status</p>
                  <p className="mt-1 text-sm font-bold text-slate-800">
                    {stockStatus(selectedProduct.stock)}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => openEditModal(selectedProduct)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-sky-500 px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5"
                >
                  <Pencil size={17} />
                  Edit Product
                </button>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default ProductManagement;
