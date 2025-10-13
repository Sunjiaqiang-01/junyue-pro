/**
 * 技师资料验证工具类
 * 用于统一管理"未填写"状态的判断和显示逻辑
 */

export class ProfileValidator {
  // 定义"未填写"的特殊标记值
  static readonly UNFILLED = {
    AGE: 0,
    HEIGHT: 0,
    WEIGHT: 0,
    CITY: "",
  } as const;

  /**
   * 判断字段是否已填写真实数据
   */
  static isFieldFilled(field: "age" | "height" | "weight" | "city", value: any): boolean {
    switch (field) {
      case "age":
        return value !== this.UNFILLED.AGE && value > 0;
      case "height":
        return value !== this.UNFILLED.HEIGHT && value > 0;
      case "weight":
        return value !== this.UNFILLED.WEIGHT && value > 0;
      case "city":
        return value !== this.UNFILLED.CITY && value.trim().length > 0;
      default:
        return false;
    }
  }

  /**
   * 获取字段的显示值
   * @param field 字段名
   * @param value 字段值
   * @param unfilledText 未填写时显示的文本，默认"未填写"
   */
  static getDisplayValue(
    field: "age" | "height" | "weight" | "city",
    value: any,
    unfilledText: string = "未填写"
  ): string {
    if (!this.isFieldFilled(field, value)) {
      return unfilledText;
    }

    switch (field) {
      case "age":
        return `${value}岁`;
      case "height":
        return `${value}cm`;
      case "weight":
        return `${value}kg`;
      case "city":
        return value;
      default:
        return unfilledText;
    }
  }

  /**
   * 检查基本信息是否完整
   */
  static isBasicInfoComplete(therapist: {
    age: number;
    height: number;
    weight: number;
    city: string;
  }): boolean {
    return (
      this.isFieldFilled("age", therapist.age) &&
      this.isFieldFilled("height", therapist.height) &&
      this.isFieldFilled("weight", therapist.weight) &&
      this.isFieldFilled("city", therapist.city)
    );
  }

  /**
   * 检查资料完整度
   */
  static checkProfileCompleteness(therapist: {
    age: number;
    height: number;
    weight: number;
    city: string;
    phone?: string | null;
    photos: any[];
    profile?: {
      introduction?: string;
    } | null;
  }) {
    const checks = {
      basicInfo: this.isBasicInfoComplete(therapist),
      introduction: !!(
        therapist.profile?.introduction && therapist.profile.introduction.trim().length > 0
      ),
      contact: !!(therapist.phone && therapist.phone.trim().length > 0),
      photos: therapist.photos.length >= 3,
    };

    const completedCount = Object.values(checks).filter((v) => v === true).length;
    const totalCount = Object.keys(checks).length;

    return {
      ...checks,
      isComplete: completedCount === totalCount,
      completionRate: Math.round((completedCount / totalCount) * 100),
    };
  }

  /**
   * 验证基本信息的有效性
   */
  static validateBasicInfo(data: { age: number; height: number; weight: number; city: string }): {
    valid: boolean;
    error?: string;
  } {
    if (!this.isFieldFilled("age", data.age)) {
      return { valid: false, error: "请填写年龄" };
    }
    if (data.age < 18 || data.age > 60) {
      return { valid: false, error: "年龄必须在18-60岁之间" };
    }

    if (!this.isFieldFilled("height", data.height)) {
      return { valid: false, error: "请填写身高" };
    }
    if (data.height < 140 || data.height > 200) {
      return { valid: false, error: "身高必须在140-200cm之间" };
    }

    if (!this.isFieldFilled("weight", data.weight)) {
      return { valid: false, error: "请填写体重" };
    }
    if (data.weight < 35 || data.weight > 150) {
      return { valid: false, error: "体重必须在35-150kg之间" };
    }

    if (!this.isFieldFilled("city", data.city)) {
      return { valid: false, error: "请填写所在城市" };
    }

    return { valid: true };
  }
}
